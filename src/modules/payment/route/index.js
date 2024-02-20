const express = require("express");
const { authenticate } = require("../../../utils");
const router = express.Router();
const {
  checkoutPayment,
  addPaymentDetail,
  stripeConnectedAccount,
  checkAccountStatus,
  withDrawRequests,
  withDrawStats,
  getWithDrawRequests,
  updateWithDrawStatus,
  getTransactions,
  payoutStats
} = require("../controller");

router.use(authenticate);
router.post("/", getTransactions);
router.post("/add-payment", addPaymentDetail);
router.get("/account-status", checkAccountStatus);
router.post("/create-account", stripeConnectedAccount);
router.post("/create-checkout-session", checkoutPayment);

router.post("/with-draw", withDrawRequests);
router.get("/with-draws", getWithDrawRequests);
router.put("/with-draw", updateWithDrawStatus);
router.get("/with-draw/stats", withDrawStats);
router.get("/payout/stats", payoutStats);

module.exports = router;
