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
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Products", productSchema);