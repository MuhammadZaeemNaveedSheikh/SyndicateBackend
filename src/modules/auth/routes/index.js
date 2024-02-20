const admin = require("./admin");
const user = require("./user");
const country = require("./country");
const express = require("express");
const adminRouter = express.Router();
const userRouter = express.Router();
const countryRouter = express.Router();

adminRouter.use("", admin);
countryRouter.use("", country);
userRouter.use("", user);

module.exports.adminAuthRoues = adminRouter;
module.exports.userAuthRoues = userRouter;
module.exports.country = countryRouter;
