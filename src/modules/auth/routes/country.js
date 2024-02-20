const express = require("express");
const router = express.Router();
const { getCountries } = require("../controllers/country");

// get
router.get("/", getCountries);

module.exports = router;
