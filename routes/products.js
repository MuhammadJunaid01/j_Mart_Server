const express = require("express");
const router = require("express").Router();

const Products = require("../models/pfoducts-model");
const uploadImag = require("../middleware/fileUpload/fileUpload");

//post product route
router.post("/addProduct", async (req, res, next) => {
  // console.log("req body", req.body);
  uploadImag(req, res, async (error) => {
    console.log("req body", req.body);
    if (error) {
      console.log(error);
    }
    const {
      categoryName,
      productName,
      manufacturerBrand,
      price,
      manufacturerName,
    } = req.body;
    try {
      const product = new Products({
        ProductName: productName,
        ManufacturerBrand: manufacturerBrand,
        ManufacturerName: manufacturerName,
        Price: price,
        Category: categoryName,
        ProductImage: req.file.filename,
      });

      const saveProduct = await product.save();
      if (saveProduct) {
        res.status(200).json({ data: saveProduct, message: "products save" });
      } else {
        res.status(404).json({ message: "opps! product not save in db" });
      }
      console.log("add product", req.body.filename);
    } catch (error) {
      next(new Error(error.message));
    }
  });
});

module.exports = router;
