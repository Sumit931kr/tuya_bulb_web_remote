require("dotenv").config(); // Load .env variables at the top

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const { controlBulb } = require("./service.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// POST route
app.post("/change", async (req, res) => {
  const { power, rgb, brightness, colorBrightness, temperature, mode } =
    req.body;
  // console.log("Received data:", { power, rgb, brightness, temperature, mode });
  await controlBulb({
    power,
    rgb,
    brightness,
    colorBrightness,
    temperature,
    mode,
  });
  // You can put your logic here
  res.json({ success: true, message: "Data received" });
});

// // Serve static files from dist folder
app.use(express.static(path.join(__dirname, "dist")));

// // Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
