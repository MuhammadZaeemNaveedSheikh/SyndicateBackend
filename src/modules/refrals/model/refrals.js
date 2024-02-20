module.exports = (sequelize, Sequelize) => {
  const refrals = sequelize.define("refrals", {
    referred: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  return refrals;
};
