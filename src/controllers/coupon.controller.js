const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { CouponServices, SubscriptionTypesServices } = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");
const { generateSecureCouponCode } = require("../utils/generateCoupon");

const createCoupon = catchAsync(async (req, res) => {
  const couponData = req.body;
  let couponCode;
  do {
    couponCode = generateSecureCouponCode(8);
  } while (await CouponServices.isCouponExist(couponCode));
  const coupon = await CouponServices.createCoupon({
    ...couponData,
    code: couponCode,
  });
  res.status(httpStatus.OK).send(coupon);
});

const updateCoupon = catchAsync(async (req, res) => {
  const coupon = await CouponServices.updateCoupon(
    req.params.couponId,
    req.body
  );
  res.send(coupon);
});

const getCoupons = catchAsync(async (req, res) => {
  let filter = pick(req.query, ["isActive", "search"]);
  if (filter.search) {
    let searchQuery = searchQueryConverter(filter.search);
    filter = {
      ...filter,
      ...searchQuery,
    };
    delete filter["search"];
  }
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await CouponServices.getCoupons(filter, options);
  res.send(result);
});

const deleteCoupon = catchAsync(async (req, res) => {
  await CouponServices.deleteCoupon(req.params.couponId);
  res.status(httpStatus.NO_CONTENT).send();
});

const applyCoupon = catchAsync(async (req, res) => {
  const { code, itemId } = req.body;
  const coupon = await CouponServices.isCouponExist(code);
  if (!coupon || !coupon.isActive) {
    throw new ApiError(httpStatus.NOT_FOUND, "invalid");
  } else if (
    coupon.expirationDate < new Date() ||
    coupon.currentUsageCount >= coupon.maxUsageCount
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "expired");
  }
  const membershipType =
    await SubscriptionTypesServices.getSubscriptionTypeById(itemId);
  const discountPrice = parseInt(
    membershipType.amount * (1 - coupon.discount / 100)
  );
  coupon.useHistory.push(req.user.id);
  coupon.currentUsageCount += 1;
  await coupon.save();
  res.status(httpStatus.OK, "success").send({ discountPrice, code: "applied" });
});

module.exports = {
  createCoupon,
  updateCoupon,
  getCoupons,
  deleteCoupon,
  applyCoupon,
};
