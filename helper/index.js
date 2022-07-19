const User = require("../models/user-model");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
require("dotenv").config();
const login = async ({ email, password }) => {
  const checkUser = await User.findOne({ email: email });
  console.log("chec user", checkUser);
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
    return user;
  }
};
module.exports = {
  login,
};
