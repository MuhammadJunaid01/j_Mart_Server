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
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successfull!"))
  .catch((error) => console.log("mongoose error", error));
app.use(cors());
// app.use(fileupload());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(upload.array());
app.use(express.static("./public"));
app.use("/public", express.static("public/products"));

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
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const users = [];
io.on("connection", (socket) => {
  // ...

  socket.on("message", (data) => {
    const findUser = users.find((user) => user.id === data.userID);
    console.log(users);
    if (!findUser) {
      users.push({ id: data.userID });
    }
    if (findUser) {
      socket.to(findUser).emit("send", data);
    }
  });
});

app.get("/", (req, res) => {
  res.send(
    "<h1 style='text-align: center' style='color: red'>Mj Mart Server is running</h1>"
  );
});

app.listen(PORT, () =>
  console.log(`server is running on http://localhost:${PORT}`)
);
