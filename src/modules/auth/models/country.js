module.exports = (sequelize, Sequelize) => {
  const adminUsers = sequelize.define("country", {
    name: Sequelize.STRING,
  });
  return adminUsers;
};
