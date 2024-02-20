const jwt = require("jsonwebtoken");
const { errorHandler } = require("../helpers/errHandler");
exports.authenticate = async (req, res, next) => {
  try {
    let token = req?.headers?.authorization?.split("Bearer ")[1];
    jwt.verify(token, process.env.JWT_TOKEN_KEY, (err, data) => {
      if (err) {
        res.send(errorHandler[401]);
      } else {
        req.user = data;
        next();
      }
    });
  } catch (err) {
    console.log("error", err);
  }
};
