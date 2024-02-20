const express = require("express");
const router = express.Router();
const { authenticate } = require("../../../utils");
const { getEarnings, getEarningStats, getBillings } = require("../controller");

router.use(authenticate);
router.get("", getEarnings);
router.get("/billings", getBillings);
router.get("/stats", getEarningStats);

module.exports = router;
