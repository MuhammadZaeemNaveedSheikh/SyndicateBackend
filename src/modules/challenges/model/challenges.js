module.exports = (sequelize, Sequelize) => {
  const challenges = sequelize.define("challenges", {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    price: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profit: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    draw_down: {
      type: Sequelize.STRING, 
      allowNull: false,
    },
    daily_loss: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    usage_months: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 3
    }
  });
  return challenges;
};
