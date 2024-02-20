const express = require("express");
const { getAll, getById, createFeedback } = require("../controller/index");
const { authenticate } = require("../../../utils");
const router = express.Router();

router.use(authenticate);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", createFeedback);

module.exports = router;
