const httpStatus = require("http-status");
const { AdminSettings } = require("../models");
const ApiError = require("../utils/ApiError");

const getDataByType = async (type) => {
  const data = await AdminSettings.findOne({ type });
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Please add referral commission!");
  }
  return data;
};

const createData = async (data) => {
  const result = await AdminSettings.create(data);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Something went Wrong!!!");
  }
  return result;
};

const updateData = async (id, data) => {
  const result = await AdminSettings.findByIdAndUpdate(id, data, { new: true });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Settings not found!");
  }
  return result;
};

module.exports = {
  getDataByType,
  createData,
  updateData,
};
