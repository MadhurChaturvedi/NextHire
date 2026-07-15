const express = require("express");
const { handleChat } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, handleChat);
// Public chat endpoint (no auth) for landing page widget
router.post("/public", handleChat);

module.exports = router;
