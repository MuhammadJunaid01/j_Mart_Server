const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const { Server } = require("socket.io");
const authRoute = require("./routes/authRoute");
const productsRoute = require("./routes/products");
const paymentRoute = require("./routes/paymentRoute");
require("dotenv").config();
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
console.log("STRIPE_SECRET", process.env.STRIPE_SECRET);
// Define allowed origins based on environment
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? "https://j-mart-gt4t.onrender.com"
    : "http://localhost:3000";

// Apply CORS middleware at the beginning of your middleware stack
app.use(
  cors({
    origin: ["https://j-mart-gt4t.onrender.com", "http://localhost:3000"],
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
    optionsSuccessStatus: 200,
  })
);

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successful!"))
  .catch((error) => console.log("mongoose error", error));

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files after CORS middleware
app.use(express.static("./public"));

app.use(authRoute);
app.use(productsRoute);
app.use(paymentRoute);

app.use((err, req, res, next) => {
  res.status(err.status || 400);
  res.json({
    message: err.message,
  });
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});
const users = [];
io.on("connection", (socket) => {
  socket.on("user", (data) => {
    users.push({ _id: data });
    socket.emit("user", data);
  });
  socket.on("msg", (data) => {
    // Your socket message handling logic
  });
});

app.get("/", (req, res) => {
  res.send(
    "<h1 style='text-align: center' style='color: red'>Mj Mart Server is running</h1>"
  );
});

httpServer.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
