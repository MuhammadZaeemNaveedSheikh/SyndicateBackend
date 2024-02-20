const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
const db = require("../../../config/index");
const { v4: uuidv4 } = require("uuid");
const { errorHandler } = require("../../../helpers/errHandler");

const createToken = async (user) => {
  try {
    //generate access token
    const token = jwt.sign({ id: user.id, isAdmin: false }, process.env.JWT_TOKEN_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
    //generate refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
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
exports.login = async (req, res, next) => {
  try {
    const email = req?.body?.email?.trim?.();
    const password = req?.body?.password?.trim?.();
    if (email && password) {
      let userData = await db.users.findOne({
        where: {
          email: email,
          deleted: false,
        },
        raw: true,
      });

      if (userData) {
        if (userData?.blocked || !userData?.active)
          return res.send(errorHandler[402]);
        let hash = userData?.password;
        let result = bcrypt.compareSync(password, hash);
        if (result) {
          let tokens = await createToken(userData);
          if (!tokens?.not_created && !tokens.error) {
            res.status(200).send({
              userId: userData?.id,
              userEmail: userData?.email,
              firstName: userData?.firstName,
              lastName: userData?.lastName,
              tokens: tokens,
              ...userData,
              success: true,
              message: "Successfully logged in",
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

exports.createUser = async (req, res) => {
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
      referralCode,
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

    const existingUser = await db.users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const hashedPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.BCRYPT_SALT)
    );
    const referralId = uuidv4();

    const user = await db.users.create(
      {
        userName,
        firstName,
        lastName,
        email,
        phoneNumber,
        country,
        countryCode,
        password: hashedPassword,
        refral: referralId,
      },
      { transaction }
    );

    if (referralCode) {
      const referrerUser = await db.users.findOne(
        {
          where: { refral: referralCode },
        },
        { transaction }
      );

      if (referrerUser) {
        await db.refrals.create(
          {
            referdBy: referrerUser.id,
            referred: user.id,
          },
          { transaction }
        );

        const [earnings, created] = await db.earnings.findOrCreate({
          where: { userId: referrerUser.id },
          defaults: { amount: 0 },
          transaction,
        });

        if (!created) {
          earnings.amount += 5;
          await earnings.save({ transaction });
        }
      }
    }

    const userId = user.id;
    await db.usersAddress.create(
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

    const tokens = await createToken(user);

    await transaction.commit();

    return res.status(201).json({
      data: user,
      success: true,
      tokens,
      message: "Signed Up Successfully",
    });
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    return res.status(500).send(errorHandler[500]);
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    let { email } = req?.body;
    if (!email) return res.send(errorHandler[400]);
    let userExists = await db.users.findOne({
      where: {
        email,
      },
    });
    console.log("---------[forgetPassword]----------", userExists);
    if (userExists) {
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
          to: userExists?.email,
          subject: "Forget Password",
          text: code,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
            db.users
              .update(
                {
                  code,
                },
                {
                  where: {
                    id: userExists?.id,
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

exports.updatePassword = async (req, res, next) => {
  try {
    let { code, password } = req?.body;
    if (!code || !password) return res.send(errorHandler[400]);
    let hashedPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.BCRYPT_SALT)
    );
    let userData = await db.users.findOne({
      where: {
        code,
      },
      raw: true,
    });
    console.log("-------[userData]-------", userData);
    if (userData) {
      let updatedRows = await db.users.update(
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

const makeCode = async () => {
  try {
    var text = "";
    var possible = "0123456789";
    let notExist = true;
    do {
      for (var i = 0; i < 6; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      let resetCode = await db.users.findOne({
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
