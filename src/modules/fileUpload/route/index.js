const express = require('express');
const router = express.Router()
const { upload } = require("../config/index");
const { authenticate } = require("../../../utils");
const { fileUpload } = require("../controller/index");

router.use(authenticate)
router.post('/', upload.single('file'), fileUpload);


module.exports = router