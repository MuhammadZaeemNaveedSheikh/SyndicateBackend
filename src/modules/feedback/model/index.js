module.exports = (sequelize, Sequelize) => {
  const feedback = sequelize.define("feedback", {
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    subject: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    message: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  return feedback;
};
