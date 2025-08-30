const express = require("express");
const authRoute = require("./auth.route");
const customers = require("./customer.route");
const contact = require("./contact.route");
const partners = require("./partner.route");
const adminRoute = require("./adminUser.route");
const promotion = require("./promotion.route");
const transaction = require("./transaction.route");
const payments = require("./payment.route");
const categories = require("./category.route");
const subscription = require("./subscription.route");
const reviews = require("./review.route");
const home = require("./home.route");
const stripe = require("./stripe.routes");
const uploader = require("./uploader.route");
const coupon = require("./coupon.route");
const payoutRequest = require("./payoutRequests.route");
const subscriptionType = require("./subscriptionType.route");
const popupAdds = require("./popupAds.route");
const notifications = require("./notifications.route");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/partners",
    route: partners,
  },
  {
    path: "/contactUs",
    route: contact,
  },
  {
    path: "/customers",
    route: customers,
  },
  {
    path: "/admin",
    route: adminRoute,
  },
  {
    path: "/promotions",
    route: promotion,
  },
  {
    path: "/transactions",
    route: transaction,
  },
  {
    path: "/payments",
    route: payments,
  },
  {
    path: "/categories",
    route: categories,
  },
  {
    path: "/subscriptions",
    route: subscription,
  },
  {
    path: "/reviews",
    route: reviews,
  },
  {
    path: "/home",
    route: home,
  },
  {
    path: "/stripe",
    route: stripe,
  },
  {
    path: "/subscription-types",
    route: subscriptionType,
  },
  {
    path: "/upload",
    route: uploader,
  },
  {
    path: "/coupons",
    route: coupon,
  },
  {
    path: "/payout-requests",
    route: payoutRequest,
  },
  {
    path: "/content-ad",
    route: popupAdds,
  },
  {
    path: "/notifications",
    route: notifications,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
