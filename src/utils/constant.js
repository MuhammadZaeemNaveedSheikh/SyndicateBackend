const CERTIFICATE_TYPES = { passing: "passing", payout: "payout" };
const CERTIFICATE_DELIVERY_TYPES = { digital: "digital", shipping: "shipping" };
const CERTIFICATE_DELIVERY_STATUSES = {
  requested: "Requested",
  approved_and_delivered: "Delivered",
  approved_and_shipped: "Shipped",
};
const ENTITY_TYPE = { challenge: "challenge", certificate: "certificate" };
module.exports = {
  CERTIFICATE_TYPES,
  CERTIFICATE_DELIVERY_TYPES,
  CERTIFICATE_DELIVERY_STATUSES,
  ENTITY_TYPE,
};
