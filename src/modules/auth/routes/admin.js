const express = require("express");
const router = express.Router();
const {
  login,
  createAdmin,
  forgetPassword,
  updatePassword,
} = require("../controllers/admin");


router.post("/login", login);
router.post("/sign-up", createAdmin);


router.post("/forget-password", forgetPassword);
router.post("/update-password", updatePassword);

module.exports = router;
