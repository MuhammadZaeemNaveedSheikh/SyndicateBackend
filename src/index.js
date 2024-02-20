const db = require("./config");
const express = require("express"),
  cors = require("cors"),
  app = express(),
  bodyParser = require("body-parser");

const {
  adminAuthRoues,
  userAuthRoues,
  country,
} = require("./modules/auth/routes");
const faqRoutes = require("./modules/FAQ/route/index");
const userRoutes = require("./modules/users/routes/index");
const adminRoutes = require("./modules/admin/route/index");
const fileRoute = require("./modules/fileUpload/route/index");
const paymentRoutes = require("./modules/payment/route/index");
const earningsRoutes = require("./modules/earnings/route/index");
const feedbackRoutes = require("./modules/feedback/route/index");
const challengesRoutes = require("./modules/challenges/route/index");
const certificateRoutes = require("./modules/certificates/route/index");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/admin", adminAuthRoues);
app.use("/admin", adminRoutes);
app.use("/user", userAuthRoues);
app.use("/user", userRoutes);
app.use("/countries", country);
app.use("/challenges", challengesRoutes);
app.use("/payment", paymentRoutes);
app.use("/earnings", earningsRoutes);
app.use("/file", fileRoute);
app.use("/faq", faqRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/certificate", certificateRoutes);
app.get("/api/test", (req, res) => {
  res.send("Server is Up!");
});

db.sequelize
  .sync({ alter: false })
  .then(() => {
    app.listen(process.env.PORT || 3000);
    //pending set timezone
    console.log("App listening on port " + process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log("err", err);
  });
