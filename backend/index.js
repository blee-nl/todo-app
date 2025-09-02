const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;

// setup CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5001"], // 프론트엔드와 브라우저 직접 접속 허용
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// log all requests
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`
  );
  next();
});

app.use(express.json());

// MongoDB connection
const uri = process.env.MONGO_URI;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// default route
app.get("/", (req, res) => {
  console.log("Handling GET / request");
  res.status(200).send("Hello from Todo Backend!");
});

// handle all unhandled requests
app.use((req, res) => {
  console.log(`Unhandled ${req.method} request to ${req.url}`);
  res.status(404).send("Not Found");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
