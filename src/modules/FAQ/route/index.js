const express = require("express");
const {
  getAll,
  getById,
  updateFAQ,
  createFAQ,
} = require("../controller/index");
const { authenticate } = require("../../../utils");
const router = express.Router();

router.use(authenticate);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", createFAQ);
router.put("/", updateFAQ);

module.exports = router;
