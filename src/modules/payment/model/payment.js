const { DataTypes } = require('sequelize');
const { ENTITY_TYPE } = require("../../../utils/constant")
module.exports = (sequelize, Sequelize) => {
  const challenges = sequelize.define("payments", {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    sessionId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type:DataTypes.ENUM('Done', 'Pending', 'Failed'),
      allowNull: false,
    },
    usage_months: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 3
    },
    entity_type: {
      type: Sequelize.ENUM,
      values: Object.values(ENTITY_TYPE),
      defaultValue: ENTITY_TYPE.challenge
    }
  });
  return challenges;
};
