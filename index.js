const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const fileupload = require("express-fileupload");
const upload = multer();

const authRoute = require("./routes/authRoute");
const productsRoute = require("./routes/products");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successfull!"))
  .catch((error) => console.log("mongoose error", error));
app.use(cors());
app.use(cors());
// app.use(fileupload());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(upload.array());
app.use(express.static("./public"));

app.use(authRoute);
app.use(productsRoute);
// app.use((req, res, next) => {
//   const error = new Error("some thing was broke");
//   error.status = 401;
//   next(error);
// });
app.use((err, req, res, next) => {
  res.status(err.status || 400);
  res.json({
    message: err.message,
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
