const axios = require("axios");
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const db = require("../../../config/index");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = {
  getTransactions: async (req, res) => {
    try {
      const { status, date, search } = req?.body;
      let whereClause = {},
        searchQuery = {};
      const pageNo = parseInt(req.query.pageNo) || 0;
      const pageSize = parseInt(req.query.pageSize) || 10;
      if (!status)
        return res
          .status(400)
          .send({ success: false, message: "Bad request." });

      if (status) whereClause["status"] = status;

      if (date)
        whereClause["createdAt"] = {
          [Op.lte]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
        };

      if (search)
        searchQuery = {
          [Op.or]: [
            { email: { [Op.like]: `%${search}%` } },
            { userName: { [Op.like]: `%${search}%` } },
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
          ],
        };
      const { count, rows } = await db.payments.findAndCountAll({
        where: whereClause,
        include: {
          model: db.users,
          where: searchQuery,
        },
        limit: pageSize,
        offset: 0,
      });

      if (count > 0) {
        res.status(200).json({
          success: true,
          data: rows,
          pageInfo: {
            totalUsers: count,
            totalPages: Math.ceil(count / pageSize),
            currentPage: pageNo,
            pageSize,
          },
        });
      } else {
        res.status(404).json({
          success: false,
          message: "No transactions found for the user.",
          data: [],
        });
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
        data: [],
      });
    }
  },
  checkoutPayment: async (req, res) => {
    let { product } = req.body;
    let lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product?.title,
            description:
              "Profit: " + product?.profit ||
              0 + " Daily Dawn: " + product?.draw_down ||
              0 + " Daily Loss: " + product?.draw_loss ||
              0,
          },
          unit_amount: Math.round(product.price),
        },
        quantity: 1,
      },
    ];
    const userId = req.user.id;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url:
        "http://localhost:5173/#/sucess?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/#/failed",
    });
    if (session) {
      await db.payments.create({
        productId: product.id,
        title: product?.title,
        status: "Pending",
        sessionId: session?.id,
        userId,
        usage_months: product?.usage_months ?? 3,
      });
    }
    res.json({ session });
  },
  addPaymentDetail: async (req, res) => {
    let { session_id } = req.body;
    try {
      await db.payments.update(
        {
          status: "Done",
        },
        { where: { sessionId: session_id } }
      );
      res.status(200).send({
        success: true,
        message: "Payment Successfull!",
      });
    } catch (err) {
      console.log("Error", err);
      res.status(500).send({
        success: false,
        message: "Server Error.",
      });
    }
  },
  stripeConnectedAccount: async (req, res) => {
    try {
      let { id } = req.user;
      const account = await stripe.accounts.create({
        type: process.env.STRIPE_CONNECTED_ACCOUNT_TYPE,
        capabilities: {
          card_payments: {
            requested: true,
          },
          transfers: {
            requested: true,
          },
        },
      });

      await db.users.update(
        {
          stripeAccountId: account.id,
          stripeAccountType: process.env.STRIPE_CONNECTED_ACCOUNT_TYPE,
        },
        {
          where: { id },
        }
      );

      let data = {
        account: account.id,
        type: process.env.STRIPE_ACCOUNT_ON_BOARDING_TYPE,
        refresh_url:
          process.env.STRIPE_CONNECTED_ACCOUNT_ON_BOARDING_REFRESH_URL,
        return_url: process.env.STRIPE_CONNECTED_ACCOUNT_ON_BOARDING_RETURN_URL,
      };

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: process.env.STRIPE_CREATE_ACCOUNT_LINKS_URL,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.STRIPE_SECRET_KEY}:`
          ).toString("base64")}`,
        },
        data: data,
      };

      const accountLink = await axios.request(config);

      return res.status(200).send({
        success: true,
        redirectUrl: accountLink?.data?.url,
      });
    } catch (err) {
      console.log("Error", err);
      res.status(500).send({
        success: false,
        message: "Server Error.",
      });
    }
  },
  checkAccountStatus: async (req, res) => {
    try {
      let { id } = req.user;
      let user = await db.users.findOne({ where: { id } });
      if (!user)
        return res.status(401).send({
          success: false,
          message: "Unauthorized",
        });

      const account = await stripe.accounts.retrieve(user.stripeAccountId);

      if (!account.charges_enabled || !account.payouts_enabled)
        return res.status(449).send({
          success: false,
          message: "Try Again",
        });

      await db.users.update(
        {
          stripeAccountStatus: true,
        },
        { where: { id } }
      );
      return res.status(200).send({
        success: true,
        message: "Account Created.",
      });
    } catch (err) {
      console.log("Error", err);
      res.status(500).send({
        success: false,
        message: "Server Error",
        err,
      });
    }
  },
  withDrawRequests: async (req, res) => {
    try {
      let { id } = req.user;
      const { amount } = req.body;
      const user = await db.earnings.findOne({ where: { userId: id } });
      console.log(user);
      if (!user || user?.amount < amount)
        return res.status(400).send({
          success: false,
          message: "Insufficient Amount.",
        });

      const withDrawExist = await db.withDrawRequests.findOne({
        where: {
          userId: id,
          status: "pending",
        },
      });

      if (withDrawExist)
        return res.status(400).send({
          success: false,
          message: "Already Have a pending withdraw request.",
        });

      await db.withDrawRequests.create({
        userId: id,
        amount: amount,
        status: "pending",
      });

      return res.status(200).send({
        success: true,
        message: "Withdraw request created.",
      });
    } catch (err) {
      console.log("Error", err);
      res.status(500).send({
        success: false,
        message: "Server Error",
        err,
      });
    }
  },
  getWithDrawRequests: async (req, res) => {
    try {
      const { id, isAdmin } = req.user;
      const pageNo = parseInt(req.query.pageNo) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const createdAtFilter = req.query.createdAt;

      // Calculate the offset based on the page number and page size
      const offset = (pageNo - 1) * pageSize;
      let result;
      // Set up filter object based on createdAt value (if present)
      const whereClause = {};
      if (createdAtFilter) {
        whereClause.createdAt = new Date(createdAtFilter);
      }
      if (isAdmin) {
        result = await db.withDrawRequests.findAndCountAll({
          where: whereClause,
          limit: pageSize,
          offset: offset,
          include: {
            model: db.users,
          },
        });
      } else {
        //TODO
      }

      // Extract total number of users and current page data
      const totalRecords = result.count;
      const currentPageData = result.rows;
      return res.status(200).send({
        success: true,
        data: currentPageData,
        pageInfo: {
          totalRecords,
          totalPages: Math.ceil(totalRecords / pageSize),
          currentPage: pageNo,
          pageSize,
        },
      });
    } catch (err) {
      console.log("Error", err);
      res.status(500).send({
        success: false,
        message: "Server Error",
        err,
      });
    }
  },
  updateWithDrawStatus: async (req, res) => {
    try {
      const { id, approved } = req?.body;
      if (!id)
        return res.status(400).send({
          success: false,
          message: "Bad request.",
        });
      const information = await db.withDrawRequests.findOne({
        where: {
          id,
        },
        include: {
          model: db.users,
        },
      });
      if (information && approved) {
        await stripe.transfers.create({
          amount: information.amount * 100,
          currency: process.env.STRIPE_CURRENCY,
          destination: information.user.stripeAccountId,
        });
        await db.earnings.update(
          {
            amount: sequelize.literal(`amount - ${information.amount}`),
          },
          { where: { userId: information.userId } }
        );
      }
      await db.withDrawRequests.update(
        {
          status: approved ? "approved" : "declined",
        },
        { where: { id } }
      );
      return res.status(200).send({
        success: true,
        message: "Successfully Done.",
      });
    } catch (err) {
      console.log("Error", err);
      res.status(500).send({
        success: false,
        message: "Server Error.",
      });
    }
  },
  withDrawStats: async (req, res) => {
    try {
      const { isAdmin, id } = req.user;
      let result;
      if(isAdmin){
        const countByStatus = await db.withDrawRequests.findAll({
          attributes: [[sequelize.literal("COUNT(*)"), "count"], "status"],
          group: ["status"],
        });
        result = JSON.parse(JSON.stringify(countByStatus)).reduce(
          (acc, item) => {
            const lowercaseStatus = (item.status || "").toLowerCase(); // Ensure status is defined and convert to lowercase
            const count = item.count; // Ensure count is defined, default to 0 if not
            acc[lowercaseStatus] = (acc[lowercaseStatus] || 0) + count;
            return acc;
          },
          {}
        );
      } else {
        const totalPayouts = await db.withDrawRequests.sum('amount', {
          where: {
            userId: id, 
            status: 'approved',
          },
        })

        const lastPayout =  await db.withDrawRequests.findOne({
          attributes: ['amount'],
          where: {
            userId: id, // Specify the user ID for whom you want to find the most recent payout
            status: 'approved', // Adjust the status as needed
          },
          order: [['createdAt', 'DESC']], // Order by createdAt in descending order to get the most recent payout
        })

        const payouts = await db.withDrawRequests.findAndCountAll({
          where: {
            userId: id
          }
        })

        result = {
          totalPayouts,
          lastPayout,
          payouts
        }
      }
      return res.status(200).send({
        success: true,
        message: "Successfully Done.",
        data: result
      });
    } catch (err) {
      console.log("Error", err);
      res.status(500).send({
        success: false,
        message: "Server Error.",
      });
    }
  },
  payoutStats: async (req, res) => {
    try {
      const { id } = req.user;
      let { pageNo, pageSize } = req?.query;
      let pagination= {}
      if(pageNo && pageSize)
        pagination = {
          limit: parseInt(pageSize),
          offset: (parseInt(pageNo) - 1) * parseInt(pageSize)
        }
      
      const { count, rows } = await db.withDrawRequests.findAndCountAll({
        where: {
          userId: id
        },
        ...pagination
      })
      return res.status(200).send({
        success: true,
        message: "data found.",
        data: rows,
        pageInfo: {
          totalUsers: count,
          totalPages: Math.ceil(count / pageSize),
          currentPage: pageNo,
          pageSize,
        },
      });
    } catch (err) {
      console.log("Error", err);
      res.status(500).send({
        success: false,
        message: "Server Error.",
      });
    }
  },
};
