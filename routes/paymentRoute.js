const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const Order = require("../models/order-model");
const User = require("../models/user-model");
const Stripe = require("stripe");
//create a new coustomer
const stripe = Stripe(
  "sk_test_51LNNMzC82usS9HEFSNfSb7TcwjFB9cvF1cscOUF69ORyvqfUdTVsNfsfasLPjVzgqfFsi0TkVVxgZLvB0WiDCPMd00BS91RGRr"
);
router.post("/payment", async (req, res, next) => {
  const { products, token, amount } = req.body;
  console.log("amount", amount);
  // console.log("TOKEN", token);
  const idempentencyKey = uuidv4();

  try {
    const charge = await stripe.charges.create({
      amount: amount,
      currency: "usd",
      source: token.id, // obtained with Stripe.js
      metadata: { order_id: token.id },
    });
    if (charge) {
      return res.status(200).json({ message: "success", data: charge });
    } else {
      return res
        .json(404)
        .json({ message: "something Wrong! ,please try again" });
    }
    // return stripe.customers
    //   .create({
    //     email: token.email,
    //     source: token.id,
    //   })
    //   .then((customer) => {
    //     console.log("hello customer", customer.id);
    //     stripe.charges.create(
    //       {
    //         amount: amount,
    //         currency: "USD",
    //         customer: customer.id,
    //         receipt_email: token.email,
    //         description: "hello",
    //       },
    //       { idempentencyKey }
    //     );
    //     console.log("hello testing");
    //   })
    //   .then((result) => {
    //     res.status(200).json({ message: "success", data: result });
    //   })
    //   .catch((err) => {
    //     console.log("ERROR", err.message);
    //     res.json(404).json({ message: "something Wrong! ,please try again" });
    //     next(err.message);
    //   });
  } catch (error) {
    console.log("ERROR", error.message);
    next(error.message);
  }
});
//order save DB
router.post("/order", async (req, res, next) => {
  try {
    const { products, amount, user, status } = req.body;
    const newOrder = new Order({
      products: products,
      amount: amount,
      orderBy: user,
      status: status,
    });
    const order = await newOrder.save();
    const data = {
      products,
      amount,
      user,
    };
    if (order) {
      res.status(200).json({ message: "OK", success: true });
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error.message);
  }
});
module.exports = router;
