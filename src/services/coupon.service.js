const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Coupon } = require("../models");
const createCoupon = async (couponData) => {
  const coupon = await Coupon.create(couponData);
  if (!coupon) {
    throw new ApiError(500, "Something went wrong");
  }
  return coupon;
};
const getCoupons = async (filters, options) => {
  const coupon = await Coupon.paginate(filters, options);
  return coupon;
};

const getCouponById = async (couponId) => {
  return Coupon.findById(couponId);
};

const isCouponExist = async (code) => {
  return Coupon.findOne({ code });
};
const updateCoupon = async (couponId, updateBody) => {
  const coupon = await getCouponById(couponId);
  Object.assign(coupon, updateBody);
  await coupon.save();
};

const deleteCoupon = async (couponId) => {
  const coupon = await getCouponById(couponId);
  await coupon.remove();
};

const applyDiscount = async (subscription, code) => {
  const coupon = await isCouponExist(code);
  if (!coupon) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid coupon code!");
  }
  const discount = subscription.amount * (coupon.discount / 100);
  return subscription.amount - discount;
};

module.exports = {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  isCouponExist,
  applyDiscount,
};
