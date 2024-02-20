const { CERTIFICATE_TYPES, CERTIFICATE_DELIVERY_TYPES, CERTIFICATE_DELIVERY_STATUSES } = require('../../../utils/constant')
module.exports = (sequelize, Sequelize) => {
  const certificates = sequelize.define("certificates", {
    certificate_type: {
      allowNull: false,
      type: Sequelize.ENUM,
      values: Object.values(CERTIFICATE_TYPES),
    },
    delivery_method: {
      allowNull: false,
      type: Sequelize.ENUM,
      values: Object.values(CERTIFICATE_DELIVERY_TYPES),
    },
    status: {
      type: Sequelize.ENUM,
      values: Object.values(CERTIFICATE_DELIVERY_STATUSES),
      defaultValue: CERTIFICATE_DELIVERY_STATUSES.requested
    },
    file: {
      type: Sequelize.STRING, 
      allowNull: true,
      defaultValue: null
    },
  });
  return certificates;
};
