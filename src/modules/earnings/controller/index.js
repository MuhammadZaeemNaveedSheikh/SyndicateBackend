const db = require("../../../config/index");
const { Sequelize } = require("sequelize");
const { errorHandler } = require("../../../helpers/errHandler");

module.exports = {
  getEarnings: async (req, res) => {
    try {
      const userId = req.user.id;
      const earnings = await db.earnings.findOne({ where: { userId: userId } });
      console.log(userId, earnings);
      if (earnings)
        return res.status(200).send({
          success: true,
          data: earnings,
          message: "Success",
        });
      else
        return res.status(200).send({
          success: false,
          message: "Not earnings Found.",
          data: {},
        });
    } catch (err) {
      console.log("Error", err);
      res.send(errorHandler[500]);
    }
  },

  getEarningStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const totalEarning = await db.refrals.count({
        where: {
          referdBy: userId,
        },
      });

      const todayEarning = await db.refrals.count({
        where: {
          referdBy: userId,
          createdAt: {
            [Sequelize.Op.gte]: Sequelize.literal("CURDATE()"),
          },
        },
      });

      const lastMonthEarning = await db.refrals.count({
        where: {
          referdBy: userId,
          createdAt: {
            [Sequelize.Op.gte]: Sequelize.literal(
              "CURDATE() - INTERVAL 1 MONTH"
            ),
          },
        },
      });

      const lastYearEarning = await db.refrals.count({
        where: {
          referdBy: userId,
          createdAt: {
            [Sequelize.Op.gte]: Sequelize.literal(
              "CURDATE() - INTERVAL 1 YEAR"
            ),
          },
        },
      });

      const totalPuchases = await db.payments.findAll({
        attributes: [
          [
            Sequelize.fn("sum", Sequelize.col("challenge.price")),
            "totalPayment",
          ],
        ],
        include: {
          model: db.challenges,
        },
        where: {
          userId,
          status: "Done",
        },
      });
      res.status(200).send({
        totalEarning: totalEarning * 5,
        todayEarning: todayEarning * 5,
        lastMonthEarning: lastMonthEarning * 5,
        signups: totalEarning,
        lastYearEarning: lastYearEarning * 5,
        totalPuchases:
          JSON.parse(JSON.stringify(totalPuchases))?.[0]?.totalPayment || 0,
      });
    } catch (err) {
      console.log("Error", err);
      res.send(errorHandler[500]);
    }
  },

  getBillings: async (req, res) => {
    try {
      const { id } = req?.user;
      const pageSize = parseInt(req?.query?.pageSize) ?? 10;
      const pageNo = parseInt((req?.query?.pageNo ?? 1) - 1) * 10;
      const type = req?.query?.type;
      const status = req?.query?.status;
      let filters = {};
      if (type) {
        filters["entity_type"] = type;
      }
      if (status) {
        filters["status"] = status;
      }
      let { count, rows } = await db.payments.findAndCountAll({
        where: { userId: id, ...filters },
        include: [
          {
            model: db.challenges,
          },
          {
            model: db.certificates,
          },
        ],
        limit: pageSize,
        offset: pageNo,
      });
      if (rows?.length > 0) {
        return res.status(200).send({
          success: true,
          data: rows,
          pageInfo: {
            count,
            totalPages: Math.ceil(count / pageSize),
            currentPage: pageNo,
            pageSize,
          },
        });
      } else {
        return res.status(200).send({
          success: false,
          data: rows,
          pageInfo: {
            count,
            totalPages: Math.ceil(count / pageSize),
            currentPage: pageNo,
            pageSize,
          },
        });
      }
    } catch (err) {
      console.log("Error", err);
      res.send(errorHandler[500]);
    }
  },
};
