const express = require("express");
const cors = require("cors");
const officerRoutes = require("./routes/officerRoutes");
const crimeRoutes = require("./routes/crimeRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Smart Crime Analytics backend is running"
  });
});
app.use("/api/officers", officerRoutes);
app.use("/api/crimes", crimeRoutes);
app.use("/api/auth", authRoutes);
module.exports = app;