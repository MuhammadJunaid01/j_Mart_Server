const User = require("../models/user-model");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const { login } = require("../helper");
const router = require("express").Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name: username, email, password, role } = req.body;

    const existEmail = await User.findOne({ email: email });
    if (existEmail) {
      res.status(400).json({ message: "user already register" });
      return;
    }
    const hashPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashPassword,
      isAdmin: role,
    });
    const result = await newUser.save();
    if (result) {
      const rec = await login({ email, password });
      res.status(200).json({ status: "OK", data: rec });
    }
  } catch (error) {
    next(new Error(error.message));
    console.log(error);
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const checkUser = await User.findOne({ email: email });
    const match = await bcrypt.compare(password, checkUser.password);
    if (match) {
      const { password, ...info } = checkUser._doc;
      const token = jwt.sign(
        {
          data: info,
        },
        process.env.SECRET,
        { expiresIn: "5h" }
      );
      const user = {
        ...info,
        token,
      };

      res.status(200).json({ user });
    } else {
      res.status(400).json({ message: "user not found" });
    }
  } catch (error) {
    next(new Error(error.message));
  }
});

//get All users
router.get("/users", async (req, res) => {
  const users = await User.find({});
  if (users) {
    res.send(users);
  } else {
    res.status(404).json({ message: "something wrong!" });
  }
});

router.put("/reset", async (req, res) => {
  console.log(req.body);
});
module.exports = router;
