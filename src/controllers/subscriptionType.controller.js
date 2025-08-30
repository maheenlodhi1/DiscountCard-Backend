const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { SubscriptionTypesServices } = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");

const createSubscriptionType = catchAsync(async (req, res) => {
  const subscriptionType =
    await SubscriptionTypesServices.createSubscriptionType(req.body);
  res.send(subscriptionType);
});

const updateSubscriptionType = catchAsync(async (req, res) => {
  const subscriptionType =
    await SubscriptionTypesServices.updateSubscriptionType(
      req.params.subscriptionTypeId,
      req.body
    );
  res.send(subscriptionType);
});

const getSubscriptionTypes = catchAsync(async (req, res) => {
  const result = await SubscriptionTypesServices.getSubscriptionTypes(
    req.query.type
  );
  res.send(result);
});

const getSubscriptionType = catchAsync(async (req, res) => {
  const subscriptionType =
    await SubscriptionTypesServices.getSubscriptionTypeById(
      req.params.subscriptionTypeId
    );
  res.send(subscriptionType);
});

const deleteSubscriptionType = catchAsync(async (req, res) => {
  await SubscriptionTypesServices.deleteSubscriptionType(
    req.params.subscriptionTypeId
  );
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSubscriptionType,
  updateSubscriptionType,
  getSubscriptionTypes,
  getSubscriptionType,
  deleteSubscriptionType,
};
