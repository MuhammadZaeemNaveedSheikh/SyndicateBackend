const express = require("express");
const {
  addAddressDetails,
  addIdentityDetails,
  addDocuments
} = require("../controllers/index");
const { authenticate } = require("../../../utils");
const router = express.Router();

router.use(authenticate)
router.post("/documents", addDocuments);
router.post("/address", addAddressDetails);
router.post("/identity", addIdentityDetails);


module.exports = router;
