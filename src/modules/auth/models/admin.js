module.exports = (sequelize, Sequelize) => {
  const Admins = sequelize.define(
    "admins",
    {
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
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      profileImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      indexes: [
        // Create a unique index on email
        {
          unique: true,
          fields: ["email"],
        },
      ],
    }
  );
  return Admins;
};
