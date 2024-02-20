const db = require("../../../config");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
  CERTIFICATE_TYPES,
  CERTIFICATE_DELIVERY_STATUSES,
  ENTITY_TYPE,
  CERTIFICATE_DELIVERY_TYPES,
} = require("../../../utils/constant");
module.exports = {
  async requestForCertificate(req, res) {
    try {
      const { id } = req?.user;
      const { certificate_type, amount, title, delivery_method } = req?.body;
      let allowed = true;
      if (certificate_type === CERTIFICATE_TYPES.passing) {
        //TODO
        //CALL BROKER API
      } else if (certificate_type === CERTIFICATE_TYPES.payout) {
        //TODO
        //CALL BROKER API
      }
      if (allowed) {
        let lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: title,
                description: `${certificate_type} certificate purchased via ${delivery_method}.`,
              },
              unit_amount: Math.round(amount),
            },
            quantity: 1,
          },
        ];
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url:
            "http://localhost:5173/#/sucess?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: "http://localhost:5173/#/failed",
        });
        let certificate;
        if (session) {
          certificate = await db.certificates.create({
            certificate_type,
            delivery_method,
            userId: id,
            status: CERTIFICATE_DELIVERY_STATUSES.requested,
          });
          await db.payments.create({
            certificateId: certificate.id,
            title: title,
            status: "Pending",
            sessionId: session?.id,
            userId: id,
            entity_type: ENTITY_TYPE.certificate,
          });
        }
        res.json({ session });
      } else {
        return res.status(400).send({
          success: false,
          message: "Bad Request",
        });
      }
    } catch (err) {
      console.log("Error", err);
      res.status(500).send({ message: "Server Error", success: false });
    }
  },
  async deliverCertificate(req, res) {
    try {
      const { id } = req?.user;
      const { certificate_id, file } = req?.body;
      const certificate = await db.certificates.findOne({
        where: { id: certificate_id },
      });

      if (
        certificate?.delivery_method === CERTIFICATE_DELIVERY_TYPES.digital &&
        !file
      ) {
        return res.status(400).send({
          success: true,
          message: "Bad Request",
        });
      }

      let status =
        certificate?.delivery_method === CERTIFICATE_DELIVERY_TYPES.digital
          ? CERTIFICATE_DELIVERY_STATUSES.approved_and_delivered
          : CERTIFICATE_DELIVERY_STATUSES.approved_and_shipped;

      await db.certificates.update(
        {
          status,
          file,
        },
        {
          where: {
            id: certificate_id,
          },
        }
      );

      return res.status(200).send({
        success: true,
        message: "Successfully Delivered.",
      });
    } catch (err) {
      console.log("Error", err);
      res.status(500).send({ message: "Server Error", success: false });
    }
  },
  async getCertificates(req, res) {
    try {
      const { id, isAdmin } = req?.user;
      const pageSize = parseInt(req?.query?.pageSize ?? 10),
        pageNo = parseInt(parseInt(req?.query?.pageNo ?? 1) - 1);

      let result = "";
      if (isAdmin) {
        result = await db.certificates.findAndCountAll({
          include: [
            {
              model: db.users,
              attributes: [
                "firstName",
                "lastName",
                "email",
                "phoneNumber",
                "profileImage",
              ],
            },
          ],
          limit: pageSize,
          offset: pageNo,
        });
      } else {
        result = await db.certificates.findAndCountAll({
          where: {
            userId: id,
          },
          include: [
            {
              model: db.users,
              attributes: [
                "firstName",
                "lastName",
                "phoneNumber",
                "profileImage",
              ],
            },
          ],
          limit: pageSize,
          offset: pageNo,
        });
      }
      const { rows, count } = result;
      if (count > 0) {
        return res.status(200).send({
          success: true,
          data: rows,
          pageInfo: {
            totalCertificates: count,
            totalPages: Math.ceil(count / pageSize),
            currentPage: pageNo,
            pageSize,
          },
        });
      } else {
        return res.status(404).send({
          success: false,
          data: rows,
        });
      }
    } catch (err) {
      console.log("Error", err);
      res.status(500).send({ message: "Server Error", success: false });
    }
  },
};
