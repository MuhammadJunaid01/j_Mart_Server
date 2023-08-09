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
app.use(cors());
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successfull!"))
  .catch((error) => console.log("mongoose error", error));

// const corsOptions = {
//   origin: "*",
//   credentials: fa, //access-control-allow-credentials:true
//   optionSuccessStatus: 200,
// };

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
    console.log("users", users);
    const findFriend = users.find((user) => user._id === data.receiverId);
    console.log("find friend", findFriend);
    console.log("data.receiverId", data.receiverId);

    if (findFriend !== undefined) {
      socket.to(findFriend._id).emit("private", data);
    }
  });
});

app.get("/", (req, res) => {
  res.send(
    "<h1 style='text-align: center' style='color: red'>Mj Mart Server is running</h1>"
  );
});

httpServer.listen(PORT, () =>
  console.log(`server is running on http://localhost:${PORT}`)
);
