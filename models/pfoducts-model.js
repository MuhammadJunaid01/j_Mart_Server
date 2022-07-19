const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    ProductName: {
      type: String,
    },
    ManufacturerName: {
      type: String,
    },
    ManufacturerBrand: {
      type: String,
    },
    Price: {
      type: String,
    },
    Category: {
      type: String,
    },
    ProductImage: {
      type: String,
    },
    description: {
      type: String,
    },
    isOffer: {
      type: Boolean,
    },
    copunCode: {
      type: String,
    },
    expireDate: {
      type: String,
    },
    percentage: {
      type: String,
    },
    stock: {
      type: String,
    },
    reviews: {
      type: [],
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Products", productSchema);
