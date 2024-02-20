const db = require("../../../config/index");
const { errorHandler } = require("../../../helpers/errHandler");

module.exports = {
  getAll: async (req, res) => {
    try {
      const pageNo = parseInt(req.query.pageNo) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const createdAtFilter = req.query.createdAt;

      const offset = (pageNo - 1) * pageSize;

      const whereClause = {};
      if (createdAtFilter) {
        whereClause.createdAt = new Date(createdAtFilter);
      }

      const faq = await db.faq.findAndCountAll({
        where: whereClause,
        limit: pageSize,
        offset: offset,
      });

      const totalRecords = faq.count;
      const currentPageData = faq.rows;
      res.status(200).json({
        data: currentPageData,
        pageInfo: {
          totalRecords,
          totalPages: Math.ceil(totalRecords / pageSize),
          currentPage: pageNo,
          pageSize,
        },
        success: true,
        message: `${currentPageData.length === 0 ? "No " : ""}Data Received`,
      });
    } catch (err) {
      console.log("Error", err);
      res.send(errorHandler[500]);
    }
  },
  getById: async (req, res) => {
    try {
      const userId = req.user.id;
      const faq = await db.faq.findAll({ where: userId });
      if (faq)
        return res.status(200).send({
          success: true,
          data: faq,
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
  createFAQ: async (req, res) => {
    const userId = req.user.id;
    const { question } = req.body;
    try {
      await db.faq.create({ question, userId });
      res.status(200).send({
        success: true,
        message: "FAQ created.",
      });
    } catch (err) {
      console.log("Error", err);
      res.send(errorHandler[500]);
    }
  },
  updateFAQ: async (req, res) => {
    try {
      const { id, answer } = req?.body;
      if (!id || !answer)
        return res.status(400).send({
          success: false,
          message: "Please provide data correctly",
        });
      await db.faq.update(
        { answer, status: true },
        {
          where: {
            id,
          },
        }
      );
      res.status(200).send({
        success: true,
        message: "FAQ updated.",
      });
    } catch (err) {
      console.log("Error", err);
      res.send(errorHandler[500]);
    }
  },
};
