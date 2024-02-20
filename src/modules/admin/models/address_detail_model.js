module.exports = (sequelize, Sequelize) => {
  const addressDetail = sequelize.define("admin_address", {
    lane1: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lane2: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    region: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    country: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    postal_code: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    identity_number: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    country_identity_name: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    country_identity_card: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    photo: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    passport_numer: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    passport_doc: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    affidavit_doc: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    agreement_doc: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    proof_of_residence_doc: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
  });
  return addressDetail;
};
