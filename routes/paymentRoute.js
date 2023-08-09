const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const Order = require("../models/order-model");
const User = require("../models/user-model");
const Stripe = require("stripe");
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? "https://j-mart-gt4t.onrender.com"
    : "http://localhost:3000";
//create a new coustomer
const stripe = Stripe(process.env.STRIPE_SECRET);
router.post("/payment", async (req, res, next) => {
  const { products, token, amount, user, status } = req.body;
  const idempentencyKey = uuidv4();

  try {
    const order = new Order({
      products: products,
      amount: amount,
      orderBy: user,
      status: status,
    });
    const charge = await stripe.charges.create({
      amount: amount,
      currency: "usd",
      source: token.id, // obtained with Stripe.js
      metadata: { order_id: token.id },
    });
    if (charge) {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigins);

      const newOrder = await order.save();
      if (newOrder) {
        return res
          .status(200)
          .json({ message: "success", data: { charge, newOrder } });
      }
    } else {
      return res
        .json(404)
        .json({ message: "something Wrong! ,please try again" });
    }
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
      res.setHeader("Access-Control-Allow-Origin", allowedOrigins);
      res.status(200).json({ message: "OK", success: true });
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error.message);
  }
});

module.exports = router;
