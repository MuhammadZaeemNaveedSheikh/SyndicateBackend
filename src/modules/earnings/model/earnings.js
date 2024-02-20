module.exports = (sequelize, Sequelize) => {
  const earnings = sequelize.define("earnings", {
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  });

  return earnings;
};
