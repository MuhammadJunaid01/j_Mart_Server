const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  products: {
    type: [],
  },
  amount: {
    type: Number,
  },
  orderBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  status: {
    type: String,
    enum: ["proccessing", "packeging", "shipment", "delivery"],
    default: "proccessing",
  },
});

module.exports = mongoose.model("Orde", orderSchema);
