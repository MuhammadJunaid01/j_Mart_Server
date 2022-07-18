const router = require("express").Router();
const ObjectId = require("mongodb").ObjectId;
const cloudinary = require("cloudinary").v2;
const multiparty = require("multiparty");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const Products = require("../models/pfoducts-model");

//post product route
router.post("/addProduct", async (req, res, next) => {
  const form = new multiparty.Form();

  form.parse(req, async function (err, fields, files) {
    if (err) {
      next(err.message);
    }

    console.log("files", files.image[0].path);
    const {
      categoryName,
      productName,
      manufacturerBrand,
      price,
      manufacturerName,
      description,
      offer,
      copunCode,
      expireDate,
      percentage,
    } = fields;

    try {
      cloudinary.uploader.upload(
        files.image[0].path,
        { folder: "products" },
        async (err, result) => {
          console.log("clodinary result", result);
          console.log("errrr cloud", err);
          if (err) {
            next(err.message);
          }
          if (result) {
            const product = new Products({
              ProductName: productName[0],
              ManufacturerBrand: manufacturerBrand[0],
              ManufacturerName: manufacturerName[0],
              Price: price[0],
              Category: categoryName[0],
              description: description[0],
              ProductImage: result.url,
              isOffer: offer[0],
              copunCode: copunCode[0],
              expireDate: expireDate[0],
              percentage: percentage[0],
            });

            const saveProduct = await product.save();
            if (saveProduct) {
              res
                .status(200)
                .json({ data: saveProduct, message: "products save" });
            } else {
              res.status(404).json({ message: "opps! product not save in db" });
            }
          }
        }
      );
    } catch (error) {
      next(error.message);
    }
  });
});

//get offer
router.get("/offer", async (req, res, next) => {
  const data = await Products.find({});
  const offer = [];
  const result = data.map((item) => {
    if (item.isOffer) {
      return offer.push(item);
    }
  });
  res.send(offer);
});

//timeout offer update
router.put("/update", async (req, res) => {
  const updateResulst = await Products.updateOne(
    { _id: ObjectId(req.body._id) },
    {
      $set: { isOffer: false },
    }
  );
  if (updateResulst) {
    res.status(200).json({ status: "OK", data: updateResulst });
  }
});

module.exports = router;
