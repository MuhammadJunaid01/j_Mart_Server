const User = require("../models/user-model");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const { login } = require("../helper");
const router = require("express").Router();
const cloudinary = require("cloudinary").v2;
const multiparty = require("multiparty");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
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
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  const users = await User.find({});
  if (users) {
    res.send(users);
  } else {
    res.status(404).json({ message: "something wrong!" });
  }
});

router.put("/editProfile", async (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  const form = new multiparty.Form();
  try {
    form.parse(req, async function (err, fields, files) {
      const autheader = req.headers.authorization;
      const token = autheader.split(" ")[1];
      const updateUser = [];
      jwt.verify(token, process.env.SECRET, async (err, user) => {
        if (err) {
          return next(err.message);
        }
        if (user) {
          cloudinary.uploader.upload(
            files.image[0].path,
            { folder: "users" },
            async (err, result) => {
              if (err) {
                next(err.message);
              }
              if (result) {
                const update = await User.findOneAndUpdate(
                  { _id: user.data._id },
                  { $set: { image: result.url } }
                );
                const updateUserImage = await update.save();
                updateUser.push(updateUserImage);
              }
            }
          );
        }
      });

      return res.send(updateUser);
      if (err) {
        return next(err.message);
      }

      // const {} = fields;
    });
  } catch (error) {
    return next(error.message);
  }
});
module.exports = router;
