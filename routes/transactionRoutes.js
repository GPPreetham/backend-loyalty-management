const express = require("express");
const router = express.Router();
const {
  addTransaction,
  getTransactionHistory,
  getAllTransactions,
} = require("../controllers/transactionController");
const authenticateToken = require("../middlewares/authMiddleware");

router.post("/", authenticateToken, addTransaction);
router.get("/history/:member_id", authenticateToken, getTransactionHistory);
router.get("/all", authenticateToken, getAllTransactions);

module.exports = router;
