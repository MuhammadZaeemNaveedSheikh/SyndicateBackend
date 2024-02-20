require("dotenv").config();
const { Op } = require("sequelize")
const db = require("../../../config/index");
const { errorHandler } = require("../../../helpers/errHandler");
exports.getUsers = async (req, res) => {
  try {
    // Extract page number, page size, and createdAt filter from the request query parameters
    const pageNo = parseInt(req.query.pageNo) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const createdAtFilter = req.query.createdAt;

    // Calculate the offset based on the page number and page size
    const offset = (pageNo - 1) * pageSize;

    // Set up filter object based on createdAt value (if present)
    const whereClause = {};
    if (createdAtFilter) {
      whereClause.createdAt = new Date(createdAtFilter);
    }

    // Fetch users with pagination and createdAt filter
    const result = await db.users.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      attributes: {
        include: [
          [db.sequelize.fn('COUNT', db.sequelize.col('payments.id')), 'totalPayments'],
          [db.sequelize.fn('COUNT', db.sequelize.literal('CASE WHEN payments.createdAt >= CURRENT_DATE - INTERVAL payments.usage_months MONTH THEN 1 ELSE NULL END')), 'currentPaymentsCount'],
        ],
      },
      include: [{
        model: db.payments,
        attributes: [],
        duplicating: false,
        where: {
          userId: { [Op.col]: 'users.id' },
        },
        required: false
      }],
      group: ['users.id'],
    });

    // Extract total number of users and current page data
    const totalUsers = result.count;
    const currentPageData = result.rows;

    res.status(200).json({
      data: currentPageData,
      pageInfo: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
        currentPage: pageNo,
        pageSize,
      },
      success: true,
      message: "Data Received",
    });
  } catch (error) {
    console.error(error);
    res.send(errorHandler[500]);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.send(errorHandler[400]);
    // Find the user by ID
    const user = await db.users.update(
      {
        deleted: true,
      },
      {
        where: {
          id,
        },
      }
    );

    console.log("deleted user", user);
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.send(errorHandler[500]);
  }
};

exports.blockUnblockUser = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || typeof status !== "boolean") return res.send(errorHandler[400]);
    // Find the user by ID
    const user = await db.users.update(
      {
        blocked: status,
      },
      {
        where: {
          id,
        },
      }
    );
    console.log(user);
    res.json({ success: true, message: "status updated!" });
  } catch (error) {
    console.error(error);
    res.send(errorHandler[500]);
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.send(errorHandler[400]);
    // Find the user by ID
    const user = await db.users.update(
      {
        active: true,
      },
      {
        where: {
          id,
        },
      }
    );
    console.log(user);
    res.json({ data: user });
  } catch (error) {
    console.error(error);
    res.send(errorHandler[500]);
  }
};

exports.addAddressDetails = async (req, res) => {
  try {
    const { lane1, lane2, city, region, country, postal_code } = req.body;
    const userId = req.user.id;
    console.log(req.body);
    if (!lane1 || !lane2 || !city || !region || !country || !postal_code)
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Invalid input.",
      });
    await db.adminAddress.create({
      lane1,
      lane2,
      city,
      region,
      country,
      postal_code,
      userId,
    });
    res.status(200).send({
      success: true,
      message: "information added.",
    });
  } catch (err) {
    console.log("Error", err);
    res.status(500).send({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
