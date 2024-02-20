module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define("users", {
    userName: Sequelize.STRING,
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    phoneNumber: Sequelize.STRING,
    country: Sequelize.STRING,
    countryCode: Sequelize.STRING,
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    refral: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    blocked: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profileImage: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    stripeAccountId: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    stripeAccountStatus: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    stripeAccountType: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
  });
  return Users;
};
