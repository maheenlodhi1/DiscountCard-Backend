const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { HomeController } = require("../controllers");

const router = express.Router();
router.route("/nearby-offers").get(HomeController.nearbyOffers);
router.route("/search").get(HomeController.searchOffers);

router.route("/").get(HomeController.getHomeData);

module.exports = router;
