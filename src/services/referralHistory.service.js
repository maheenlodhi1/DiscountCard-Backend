const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { ReferralHistory } = require("../models");
// const { generateSecureReferralCode } = require("../utils/generateReferralCode");
const createReferral = async (referralData) => {
  // if (await getReferralHistoryByReferee(referralData.refereeId)) {
  //   throw new ApiError(
  //     httpStatus.ALREADY_REPORTED,
  //     "Referral COde for this suer already exists"
  //   );
  // }
  // let referCode;
  // do {
  //   referCode = generateSecureReferralCode(8);
  // } while (await isReferralHistoryExist(referCode));
  const referralHistory = await ReferralHistory.create({
    ...referralData,
    // code: referCode,
  });
  if (!referralHistory) {
    throw new ApiError(500, "Something went wrong");
  }
  return referralHistory;
};
const getReferralHistories = async (filters, options) => {
  const referralHistory = await ReferralHistory.paginate(filters, options);
  return referralHistory;
};

const getReferralHistoryById = async (referralHistoryId) => {
  return ReferralHistory.findById(referralHistoryId);
};

const getReferralHistoryByReferee = async (userId) => {
  return ReferralHistory.findOne({ refereeId: userId });
};

const isReferralHistoryExist = async (referee) => {
  return ReferralHistory.findOne({ referee });
};

const deleteReferralHistory = async (referralHistoryId) => {
  const referralHistory = await getReferralHistoryById(referralHistoryId);
  await referralHistory.remove();
};

const updateReferralHistory = async (userData) => {
  const { referralId, userId } = userData;
  const referralHistory = await isReferralHistoryExist(referralId);
  if (!referralHistory || !referralHistory.isActive) {
    // throw new ApiError(httpStatus.NOT_FOUND, "invalid");
    return;
  }
  if (referralHistory.useHistory.includes(userId)) {
    // throw new ApiError(
    //   httpStatus.FORBIDDEN,
    //   "This user has already used that referral"
    // );
    return;
  }
  referralHistory.useHistory.push(userId);
  referralHistory.usageCount += 1;
  await referralHistory.save();
};

module.exports = {
  createReferral,
  getReferralHistories,
  updateReferralHistory,
  deleteReferralHistory,
  isReferralHistoryExist,
};
