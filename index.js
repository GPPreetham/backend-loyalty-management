const express = require("express");
const cors = require("cors");
require("dotenv").config();
const memberRoutes = require("./routes/memberRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const pointsRoutes = require("./routes/pointsRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/members", memberRoutes);
app.use("/transactions", transactionRoutes);
app.use("/points", pointsRoutes);
app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
