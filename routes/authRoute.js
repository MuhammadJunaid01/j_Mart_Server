const User = require("../models/user-model");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const router = require("express").Router();

router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
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
    });
    const result = await newUser.save();
    res.status(200).json({ message: result });
  } catch (error) {
    next(new Error(error.message));
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const checkUser = await User.findOne({ email: email });
    // console.log(user);
    const match = await bcrypt.compare(password, checkUser.password);
    if (match) {
      const { password, ...info } = checkUser._doc;
      const token = jwt.sign(
        {
          data: info,
        },
        process.env.SECRET,
        { expiresIn: "1h" }
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
module.exports = router;
