const express = require("express");
const router = express.Router();
const {
  getUsers,
  blockUnblockUser,
  deleteUser,
  approveUser,
  addAddressDetails,
} = require("../controllers/index");
const { authenticate } = require("../../../utils");

router.get("/get-users", getUsers);
router.post("/blockUnblockUser", blockUnblockUser);
router.patch("/approve-user", approveUser);
router.delete("/delete-user", deleteUser);

router.use(authenticate);
router.post("/address-detail", addAddressDetails);

module.exports = router;
