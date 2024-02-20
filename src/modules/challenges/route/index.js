const express = require("express");
const {
  getAllChallenges,
  createChallenges,
  updateChallenge,
} = require("../controller/index");
const { authenticate } = require("../../../utils");
const router = express.Router();

router.use(authenticate);
router.get("/", getAllChallenges);
router.post("/", createChallenges);
router.put("/", updateChallenge);

module.exports = router;
