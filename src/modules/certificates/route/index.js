const express = require("express");
const { authenticate } = require("../../../utils");
const { requestForCertificate, deliverCertificate, getCertificates } = require("../controller");
const router = express.Router();

router.use(authenticate);
router.get("/", getCertificates);
router.post("/deliver", deliverCertificate);
router.post("/apply", requestForCertificate);

module.exports = router;
