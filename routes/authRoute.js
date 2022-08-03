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
  const users = await User.find({});
  if (users) {
    res.send(users);
  } else {
    res.status(404).json({ message: "something wrong!" });
  }
});

// router.put("/editProfile", async (req, res, next) => {
//   const form = new multiparty.Form();
//   form.parse(req, async function (err, fields, files) {
//     const autheader = req.headers.authorization;
//     const token = autheader.split(" ")[1];
//     console.log("files", req.body);
//   });
//   // form.parse(req, async function (err, fields, files) {
//   //   const autheader = req.headers.authorization;
//   //   const token = autheader.split(" ")[1];
//   //   console.log("files", req.body);

//   //   console.log("files", files);
//   //   console.log("feilds", fields);
//   //   // try {
//   //   //   jwt.verify(token, process.env.SECRET, async (err, user) => {
//   //   //     if (err) {
//   //   //       return res.status(403).json("user token");
//   //   //     }
//   //   //     if (user) {
//   //   //       console.log("decoded", user);
//   //   //       // return res.send(user);

//   //   //       // const result = await User.findOneAndUpdate(
//   //   //       //   { _id: user.data._id },
//   //   //       //   { $push: { image: {} } }
//   //   //       // );
//   //   //       // cloudinary.uploader.upload(
//   //   //       //   files.image[0].path,
//   //   //       //   { folder: "users" },
//   //   //       //   async (err, result) => {
//   //   //       //     if (err) {
//   //   //       //       next(err.message);
//   //   //       //     }
//   //   //       //     if (result) {
//   //   //       //     }
//   //   //       //   }
//   //   //       // );
//   //   //     }
//   //   //   });
//   //   //   return res.json("user success");
//   //   // } catch (error) {
//   //   //   console.log(error.message);
//   //   //   return next(error.message);
//   //   // }
//   //   // if (err) {
//   //   //   return next(err.message);
//   //   // }
//   //   // const image = files.image[0].path;
//   //   console.log("image", files);
//   // });
// });
router.put("/editProfile", async (req, res, next) => {
  const form = new multiparty.Form();

  form.parse(req, async function (err, fields, files) {
    console.log("feilds", fields);
    console.log("files,files", files);
    if (err) {
      return next(err.message);
    }

    // const {} = fields;

    try {
      // cloudinary.uploader.upload(
      //   files.image[0].path,
      //   { folder: "products" },
      //   async (err, result) => {
      //     if (err) {
      //       next(err.message);
      //     }
      //     if (result) {
      //       const product = new Products({
      //         ProductName: productName[0],
      //         ManufacturerBrand: manufacturerBrand[0],
      //         ManufacturerName: manufacturerName[0],
      //         Price: price[0],
      //         Category: categoryName[0],
      //         description: description[0],
      //         ProductImage: result.url,
      //         isOffer: offer[0],
      //         copunCode: copunCode[0],
      //         expireDate: expireDate[0],
      //         percentage: percentage[0],
      //         stock: stock[0],
      //       });
      //       const saveProduct = await product.save();
      //       if (saveProduct) {
      //         return res
      //           .status(200)
      //           .json({ data: saveProduct, message: "products save" });
      //       } else {
      //         return res
      //           .status(404)
      //           .json({ message: "opps! product not save in db" });
      //       }
      //     }
      //   }
      // );
    } catch (error) {
      return next(error.message);
    }
  });
});
module.exports = router;
