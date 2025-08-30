const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { AdsPopup } = require("../models");

const createPopupAd = async (addPopupData) => {
  const alreadyPopup = await AdsPopup.findOne({
    title: addPopupData.title,
  });
  if (alreadyPopup) {
    throw new ApiError(
      httpStatus.ALREADY_REPORTED,
      "Popup Ad  with this title already exists"
    );
  }
  const addPopup = await AdsPopup.create(addPopupData);
  if (!addPopup) {
    throw new ApiError(500, "Something went wrong");
  }
  return addPopup;
};

const getPopupAds = async (filters, options) => {
  const coupon = await AdsPopup.paginate(filters, options);
  return coupon;
};

const getPopupAdById = async (addPopupId) => {
  const addPopup = await AdsPopup.findById(addPopupId);
  if (!addPopup) {
    throw new ApiError(httpStatus.NOT_FOUND, "PopAd not found!");
  }
  return addPopup;
};

const updatePopupAd = async (addPopupId, updateBody) => {
  const addPopup = await getPopupAdById(addPopupId);
  Object.assign(addPopup, updateBody);
  return await addPopup.save();
};

const deletePopupAd = async (addPopupId) => {
  const addPopup = await getPopupAdById(addPopupId);
  return addPopup.remove();
};

const getPopupAd = async () => {
  const count = await AdsPopup.countDocuments(); // Get total count
  const random = Math.floor(Math.random() * count); // Generate random index
  const randomAd = await AdsPopup.findOne().skip(random); // Skip to random index
  return randomAd;
};
module.exports = {
  createPopupAd,
  updatePopupAd,
  deletePopupAd,
  getPopupAdById,
  getPopupAds,
  getPopupAd,
};
