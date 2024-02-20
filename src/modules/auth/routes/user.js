const express = require("express");
const {
  login,
  createUser,
  forgetPassword,
  updatePassword,
} = require("../controllers/users");
const router = express.Router();

router.post("/login", login);
router.post("/sign-up", createUser);

router.post("/forget-password", forgetPassword);
router.post("/update-password", updatePassword);

module.exports = router;
