const router = require("express").Router();
require("dotenv").config();

const Stripe = require("stripe");
//create a new coustomer
const stripe = Stripe(process.env.PUBLISHABLE_KEY);
router.post("/payment", async (req, res, next) => {
  console.log("say hello stripe payment");

  try {
    const { product, amount, id } = req.body;
    const payment = await stripe.paymentIntents.create({
      amount: amount,
      currency: "USD",
      description: "mjMart",
      payment_method: id,
      confirm: true,
    });
    if (payment) {
      return res
        .status(200)
        .json({ message: "payment success", success: true });
    }
  } catch (error) {
    next(error.message);
    res.status(400).json({ message: "payment incomplete", success: false });
  }
});
//order save DB
router.post("/order", async (req, res) => {
  const { products, amount, user } = req.body;
  console.log("hitted backend route", req.body);
  res
    .status(200)
    .json({ message: "success", success: true, data: "hello junaid" });
});
module.exports = router;
