const db = require("../../../config/index");
const { errorHandler } = require("../../../helpers/errHandler");

module.exports = {
  getAll: async (req, res) => {
    try {
      const feedback = await db.feedback.findAll();
      if (feedback)
        return res.status(200).send({
          success: true,
          data: feedback,
          message: "Success",
        });
      else
        return res.status(200).send({
          success: false,
          message: "No Data Found.",
          data: {},
        });
    } catch (err) {
      console.log("Error", err);
      res.send(errorHandler[500]);
    }
  },
  getById: async (req, res) => {
    try {
      const userId = req.user.id;
      const feedback = await db.feedback.findAll({ where: userId });
      if (feedback)
        return res.status(200).send({
          success: true,
          data: feedback,
          message: "Success",
        });
      else
        return res.status(200).send({
          success: false,
          message: "No Data Found.",
          data: {},
        });
    } catch (err) {
      console.log("Error", err);
      res.send(errorHandler[500]);
    }
  },
  createFeedback: async (req, res) => {
    const userId = req.user.id;
    const { type, subject, message } = req.body;
    try {
      await db.feedback.create({ type, subject, message, userId });
      res.status(200).send({
        success: true,
        message: "feedback created.",
      });
    } catch (err) {
      console.log("Error", err);
      res.send(errorHandler[500]);
    }
  },
};
