const databaseConfig = require("./database");
const Sequelize = require("sequelize");
require("dotenv").config();
const sequelizeInstance = new Sequelize(
  databaseConfig.DB,
  databaseConfig.USER,
  databaseConfig.PASSWORD,
  {
    host: databaseConfig.HOST,
    port: process.env.DB_PORT || 3306,
    dialect: databaseConfig.dialect,
    operatorsAliases: 0,

    pool: {
      max: databaseConfig.pool.max,
      min: databaseConfig.pool.min,
      acquire: databaseConfig.pool.acquire,
      idle: databaseConfig.pool.idle,
    },
  }
);
const db = {};

db.users = require("../modules/auth/models/user")(sequelizeInstance, Sequelize);
db.country = require("../modules/auth/models/country")(
  sequelizeInstance,
  Sequelize
);
db.admins = require("../modules/auth/models/admin")(
  sequelizeInstance,
  Sequelize
);
db.usersAddress = require("../modules/users/models/user_detail_model")(
  sequelizeInstance,
  Sequelize
);
db.adminAddress = require("../modules/admin/models/address_detail_model")(
  sequelizeInstance,
  Sequelize
);
db.challenges = require("../modules/challenges/model/challenges")(
  sequelizeInstance,
  Sequelize
);
db.payments = require("../modules/payment/model/payment")(
  sequelizeInstance,
  Sequelize
);
db.refrals = require("../modules/refrals/model/refrals")(
  sequelizeInstance,
  Sequelize
);
db.earnings = require("../modules/earnings/model/earnings")(
  sequelizeInstance,
  Sequelize
);

db.withDrawRequests = require("../modules/payment/model/withdraw_request")(
  sequelizeInstance,
  Sequelize
);

db.faq = require("../modules/FAQ/model")(sequelizeInstance, Sequelize);
db.feedback = require("../modules/feedback/model")(
  sequelizeInstance,
  Sequelize
);

db.certificates = require("../modules/certificates/models/certificates")(
  sequelizeInstance,
  Sequelize
);

db.usersAddress.belongsTo(db.users, { foreignKey: "userId" });
db.adminAddress.belongsTo(db.admins, { foreignKey: "userId" });
db.users.hasMany(db.payments, { foreignKey: "userId" });
db.payments.belongsTo(db.users, { foreignKey: "userId" });
db.payments.belongsTo(db.challenges, { foreignKey: "productId" });
db.payments.belongsTo(db.certificates, { foreignKey: "certificateId" });
db.refrals.belongsTo(db.users, { foreignKey: "referdBy" });
db.earnings.belongsTo(db.users, { foreignKey: "userId" });
db.faq.belongsTo(db.users, { foreignKey: "userId" });
db.feedback.belongsTo(db.users, { foreignKey: "userId" });
db.withDrawRequests.belongsTo(db.users, { foreignKey: "userId" });
db.certificates.belongsTo(db.users, { foreignKey: "userId" });

db.users.hasMany(db.usersAddress, { foreignKey: "userId" });
db.users.hasMany(db.refrals, { foreignKey: "referdBy" });
db.users.hasMany(db.withDrawRequests, { foreignKey: "userId" });
db.users.hasMany(db.faq, { foreignKey: "userId" });
db.users.hasMany(db.feedback, { foreignKey: "userId" });
db.users.hasMany(db.certificates, { foreignKey: "userId" });
db.certificates.hasOne(db.payments, { foreignKey: "certificateId" });
db.challenges.hasMany(db.payments, { foreignKey: "productId" });

db.Sequelize = Sequelize;
db.sequelize = sequelizeInstance;

module.exports = db;
