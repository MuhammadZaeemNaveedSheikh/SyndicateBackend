const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  const withDrawRequests = sequelize.define("withdraw_requests", {
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'completed', 'declined'),
      allowNull: false,
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });
  return withDrawRequests;
};
