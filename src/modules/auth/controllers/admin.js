require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
const db = require("../../../config/index");
const { errorHandler } = require("../../../helpers/errHandler");
/*************************** **************************/
// create token on admin
const createToken = async (admin) => {
  try {
    //generate access token
    const token = jwt.sign({ id: admin.id, isAdmin: true }, process.env.JWT_TOKEN_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
    //generate refresh token
    const refreshToken = jwt.sign(
      { id: admin.id },
      process.env.JWT_REFRESH_TOKEN_KEY
    );
    return {
      accessToken: token,
      refreshToken: refreshToken,
    };
  } catch (err) {
    console.log("error", err);
    return { error: true };
  }
};

// create code for admin email verification
const makeCode = async () => {
  try {
    var text = "";
    var possible = "0123456789";
    let notExist = true;
    do {
      for (var i = 0; i < 6; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      let resetCode = await db.admins.findOne({
        where: {
          code: text,
        },
        raw: true,
      });
      console.log("resetCode", resetCode);
      if (!resetCode) {
        notExist = false;
      }
    } while (notExist);
    return text;
  } catch (err) {
    console.log("error", err);
    return { error: true };
  }
};

//send email of forget password
exports.forgetPassword = async (req, res) => {
  try {
    let { email } = req?.body;
    if (!email) return res.send(errorHandler[400]);
    let adminExists = await db.admins.findOne({
      where: {
        email,
      },
    });
    console.log("---------[forgetPassword]----------", adminExists);
    if (adminExists) {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SENDER_EMAIL,
          pass: process.env.SENDER_PASS,
        },
      });
      let code = await makeCode();
      if (!code.error) {
        var mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: adminExists?.email,
          subject: "Forget Password",
          text: code,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
            db.admins
              .update(
                {
                  code,
                },
                {
                  where: {
                    id: adminExists?.id,
                  },
                }
              )
              .then(() => {
                res.status(200).send({
                  success: true,
                  message: "code is sent to your email.",
                });
              });
          }
        });
      } else {
        res.send(errorHandler[400]);
      }
    } else {
      res.send(errorHandler[400]);
    }
  } catch (err) {
    console.log("error", err);
    res.send(errorHandler[500]);
  }
};
/*********************** *********************/
exports.login = async (req, res, next) => {
  try {
    const email = req?.body?.email?.trim?.();
    const password = req?.body?.password?.trim?.();
    if (email && password) {
      let adminData = await db.admins.findOne({
        where: {
          email: email,
        },
        raw: true,
      });

      if (adminData) {
        let hash = adminData?.password;
        let result = bcrypt.compareSync(password, hash);
        if (result) {
          let tokens = await createToken(adminData);
          if (!tokens?.not_created && !tokens.error) {
            res.status(200).send({
              adminId: adminData?.id,
              adminEmail: adminData?.email,
              firstName: adminData?.firstName,
              lastName: adminData?.lastName,
              tokens: tokens,
              success: true,
              message: "Successfully logged in",
              ...adminData,
            });
          } else if (tokens?.not_created) {
            res.send(errorHandler[400]);
          } else if (tokens?.error) {
            res.send(errorHandler[503]);
          } else {
            res.send(errorHandler[500]);
          }
        } else {
          res.status(201).send({
            success: false,
            message: "Invalid password",
          });
        }
      } else {
        res.send(errorHandler[404]);
      }
    } else {
      res.send(errorHandler[400]);
    }
  } catch (err) {
    console.log("error", err);
    res.send(errorHandler["503"]);
  }
};

exports.verifyTwoFactor = async (req, res, next) => {
  try {
    let { code } = req?.body;
    console.log("...admin two factor...");
    let adminData = await db.admins.findOne({
      where: {
        code,
      },
    });
    console.log(
      "------[verifyTwoFactor]--------{adminData}--------",
      adminData
    );
    if (adminData) {
      let tokens = await createToken(adminData);
      if (!tokens?.not_created && !tokens.error) {
        await db.admins.update(
          {
            code: null,
          },
          {
            where: {
              id: adminData?.id,
            },
          }
        );
        res.status(200).send({
          adminId: adminData?.id,
          adminEmail: adminData?.email,
          firstName: adminData?.firstName,
          lastName: adminData?.lastName,
          tokens: tokens,
          ...adminData,
        });
      } else if (tokens?.not_created) {
        res.send(errorHandler[400]);
      } else if (tokens?.error) {
        res.send(errorHandler[503]);
      } else {
        res.send(errorHandler[500]);
      }
    } else {
      res.send(errorHandler[400]);
    }
  } catch (err) {
    console.log("error", err);
    res.send(errorHandler[503]);
  }
};

exports.updateTwoFactorStatus = async (req, res, next) => {
  try {
    let { id } = req?.user;
    let userData = await db.admins.findOne({
      where: {
        id,
      },
    });
    if (userData) {
      let updateStatus = await db.admins.update(
        {
          twoFactorEnabled: userData?.twoFactorEnabled ? false : true,
        },
        {
          where: {
            id,
          },
        }
      );
      if (updateStatus[0] > 0) {
        res
          .status(200)
          .send({ success: true, message: "Two Factor Status Updated." });
      } else {
        res.send(errorHandler[400]);
      }
    } else {
      res.send(errorHandler[400]);
    }
  } catch (err) {
    console.log("error", err);
    res.send(errorHandler[503]);
  }
};

// update password after email for admin.
exports.updatePassword = async (req, res, next) => {
  try {
    let { code, password } = req?.body;
    if (!code || !password) return res.send(errorHandler[400]);
    let hashedPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.BCRYPT_SALT)
    );
    let userData = await db.admins.findOne({
      where: {
        code,
      },
      raw: true,
    });
    console.log("-------[userData]-------", userData);
    if (userData) {
      let updatedRows = await db.admins.update(
        {
          password: hashedPassword,
          code: null,
        },
        {
          where: {
            id: userData?.id,
          },
        }
      );
      console.log("updatedRows", updatedRows);
      if (updatedRows[0] > 0) {
        res.status(200).send({ success: true, message: "password update." });
      } else {
        res.send(errorHandler[400]);
      }
    } else {
      res.send(errorHandler[400]);
    }
  } catch (err) {
    console.log("error", err);
    res.send(errorHandler[500]);
  }
};

exports.createAdmin = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const {
      userName,
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      countryCode,
      password,
      lane1,
      lane2,
      city,
      region,
      postal_code,
      identity_number,
      country_identity_name,
      country_identity_card,
      photo,
      passport_numer,
      passport_doc,
      affidavit_doc,
      agreement_doc,
      proof_of_residence_doc,
    } = req.body;

    const checkRequired = Object.values(req.body).some((a) => a === "");
    if (checkRequired) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Invalid input. Please provide all required fields",
      });
    }
    const existingUser = await db.admins.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Admin with this email already exists.",
      });
    }
    const hashedPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.BCRYPT_SALT)
    );

    const admin = await db.admins.create(
      {
        userName,
        firstName,
        lastName,
        email,
        phoneNumber,
        country,
        countryCode,
        password: hashedPassword,
      },
      { transaction }
    );
    const userId = admin.id;
    await db.adminAddress.create(
      {
        lane1,
        lane2,
        city,
        region,
        postal_code,
        country,
        identity_number,
        country_identity_name,
        country_identity_card,
        photo,
        passport_numer,
        passport_doc,
        affidavit_doc,
        agreement_doc,
        proof_of_residence_doc,
        userId,
      },
      { transaction }
    );
    let tokens = await createToken(admin);
    await transaction.commit();
    res.status(201).json({
      data: admin,
      success: true,
      tokens,
      message: "Signed Up Successfull",
    });
  } catch (error) {
    console.error(error);
    res.send(errorHandler[500]);
  }
};
