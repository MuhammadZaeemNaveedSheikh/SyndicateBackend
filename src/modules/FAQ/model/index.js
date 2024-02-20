module.exports = (sequelize, Sequelize) => {
  const faq = sequelize.define("faq", {
    question: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    answer: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "",
    },
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  return faq;
};
