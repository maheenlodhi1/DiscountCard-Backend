const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const {
  customerServices,
  WalletServices,
  SubscriptionsServices,
  transactionService,
} = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");
const config = require("../config/config");
const { addTranslatedLocale } = require("../utils/addTranslatedLocale");

const updateCustomer = catchAsync(async (req, res) => {
  req.body.targetLang = req.targetLang;
  const customer = await customerServices.updateUserById(
    req.params.customerId,
    req.body
  );

  res.send(customer);
});

const getCustomers = catchAsync(async (req, res) => {
  let filter = pick(req.query, ["isActive", "search", "raw"]);
  let result;
  if (filter.raw) {
    result = await customerServices.getRawCustomers();
  } else {
    if (filter.search) {
      let searchQuery = searchQueryConverter(filter.search, "$or", [
        "firstName",
        "lastName",
        "email",
      ]);
      filter = {
        ...filter,
        ...searchQuery,
      };
      delete filter["search"];
    }
    filter.isDeleted = false;
    let options = pick(req.query, ["sortBy", "limit", "page"]);
    if (req.user && req.user.userType === "admin") {
      Object.assign(options, {
        populate: "referralHistory-usageCount",
      });
    }
    result = await customerServices.queryUsers(filter, options);
  }
  res.send(result);
});

const getCustomer = catchAsync(async (req, res) => {
  let getReferHistory = false;
  if (req.user && req.user.userType === "admin") {
    getReferHistory = true;
  }
  const customer = await customerServices.getUserById(
    req.params.customerId,
    true,
    getReferHistory
  );
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
  }
  res.send(customer);
});

const deleteCustomer = catchAsync(async (req, res) => {
  const user = await customerServices.deleteUserById(req.params.customerId);
  await SubscriptionsServices.deleteUserSubscription(req.params.customerId);
  res.status(httpStatus.NO_CONTENT).send();
});

const addPaymentDetails = catchAsync(async (req, res) => {
  const { customerId } = req.body;
  const customer = await customerServices.getUserById(customerId);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Customer not found!");
  }
  const wallet = await WalletServices.addWalletPaymentDetails(req.body);
  res
    .status(httpStatus.NO_CONTENT)
    .send({ message: "Payments Details added successfully!" });
});

const updatePaymentDetails = catchAsync(async (req, res) => {
  const { customerId } = req.params;
  const customer = await customerServices.getUserById(customerId);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Customer not found!");
  }
  const wallet = await WalletServices.updateCustomerWallet(
    customerId,
    req.body
  );
  res
    .status(httpStatus.NO_CONTENT)
    .send({ message: "Payments Details updated successfully!" });
});

const getCustomerWallet = catchAsync(async (req, res) => {
  const { customerId } = req.params;
  const customer = await customerServices.getUserById(customerId);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Customer not found!");
  }
  const wallet = await WalletServices.getWalletByCustomerId(
    customerId,
    "customer"
  );
  res.status(httpStatus.OK).send(wallet);
});

const createCustomer = catchAsync(async (req, res) => {
  req.body.targetLang = req.targetLang;
  const translateData = await addTranslatedLocale(req.body, [
    "firstName",
    "lastName",
  ]);
  const customer = await customerServices.createUser(translateData, "admin");
  res.status(httpStatus.OK).send(customer);
});

const getDashboardStats = catchAsync(async (req, res) => {
  const data = await transactionService.getCustomerStats(req.user.id);
  res.status(httpStatus.OK).send(data);
});

const verifyReferral = catchAsync(async (req, res) => {
  const customer = await customerServices.getUserById(
    req.params.referralId,
    false,
    false
  );

  if (!customer) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid referral");
  }
  res
    .status(httpStatus.OK)
    .send({ referrerName: `${customer.firstName} ${customer.lastName}` });
});

module.exports = {
  updateCustomer,
  getCustomers,
  getCustomer,
  deleteCustomer,
  addPaymentDetails,
  updatePaymentDetails,
  getCustomerWallet,
  verifyReferral,
  createCustomer,
  getDashboardStats,
};
