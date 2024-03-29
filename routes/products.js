const router = require("express").Router();
const ObjectId = require("mongodb").ObjectId;
const cloudinary = require("cloudinary").v2;
const multiparty = require("multiparty");
require("dotenv").config();
const Order = require("../models/order-model");
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
      return next(err.message);
    }

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
      stock,
    } = fields;

    try {
      cloudinary.uploader.upload(
        files.image[0].path,
        { folder: "products" },
        async (err, result) => {
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
              stock: stock[0],
            });

            const saveProduct = await product.save();
            if (saveProduct) {
              return res
                .status(200)
                .json({ data: saveProduct, message: "products save" });
            } else {
              return res
                .status(404)
                .json({ message: "opps! product not save in db" });
            }
          }
        }
      );
    } catch (error) {
      return next(error.message);
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
  return res.send(offer);
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
    return res.status(200).json({ status: "OK", data: updateResulst });
  }
});

router.get("/allProducts", async (rq, res, next) => {
  const products = await Products.find({});
  // console.log("products", products);
  if (!products) {
    return res.status(404).json({ message: "something wron", data: {} });
  }
  return res.status(200).json({ message: "success", data: products });
});

//review products
router.post("/review", async (req, res, next) => {
  console.log("req body", req.body);
  const result = await Products.findOneAndUpdate(
    { _id: req.body.id },
    {
      $push: { reviews: { id: req.body.id, reveiw: req.body.text } },
    }
  );

  return res.send(result);
});

//best sale products
router.get("/bestSaleProducts", async (req, res, next) => {
  try {
    const ordersWithHighQuantityProducts = await Order.aggregate([
      {
        $match: {
          "products.quantity": { $gt: 7 }, // Match orders with products.quantity > 7
        },
      },
      {
        $project: {
          products: {
            $filter: {
              input: "$products",
              as: "product",
              cond: { $gt: ["$$product.quantity", 7] }, // Filter products with quantity > 7
            },
          },
          amount: 1,
          orderBy: 1,
          status: 1,
        },
      },
    ]);

    res
      .status(200)
      .json({ message: "success", data: ordersWithHighQuantityProducts });
  } catch (error) {
    console.log("ERROR", error.message);
    next(error.message);
  }
});
module.exports = router;
