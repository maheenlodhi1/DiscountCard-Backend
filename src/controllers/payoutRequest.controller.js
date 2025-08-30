const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { PayoutRequestsService } = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");
const {
  getEncryptedPayoutDetailsObject,
  decryptObject,
  encryptObject,
  encrypt,
  decrypt,
} = require("../utils/encryption");

const updatePayoutRequest = catchAsync(async (req, res) => {
  const encryptedBody = req.body.toString();
  const decryptedText = decrypt(encryptedBody);
  let decryptedPayload = JSON.parse(decryptedText);
  decryptedPayload = pick(decryptedPayload, [
    "status",
    "receiptUrl",
    "rejectionReason",
  ]);
  const payoutRequest = await PayoutRequestsService.updatePayoutRequest(
    req.params.payoutRequestId,
    decryptedPayload
  );
  res.status(httpStatus.OK).send();
});

const getCustomerPayoutRequests = catchAsync(async (req, res) => {
  let filter = pick(req.query, ["search"]);
  if (filter.search) {
    let searchQuery = searchQueryConverter(filter.search);
    filter = {
      ...filter,
      ...searchQuery,
    };
    delete filter["search"];
  }
  if (req.user.userType === "customer") filter.userId = req.user.id;
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  // Object.assign(options, {
  //   populate: "promotion-title locations categoryName locale",
  // });
  const result = await PayoutRequestsService.getPayoutRequests(filter, options);
  res.send(result);
});

const deletePayoutRequest = catchAsync(async (req, res) => {
  await PayoutRequestsService.deletePayoutRequest(req.params.payoutRequestId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getPayoutRequest = catchAsync(async (req, res) => {
  let data = await PayoutRequestsService.getPayoutRequestsById(
    req.params.payoutRequestId,
    true
  );
  const encryptedAccountData = getEncryptedPayoutDetailsObject(data.accountId);
  const decryptedData = decryptObject(encryptedAccountData);
  delete data["accountId"];
  data["accountDetails"] = decryptedData;
  const response = encrypt(JSON.stringify(data));
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  updatePayoutRequest,
  getCustomerPayoutRequests,
  deletePayoutRequest,
  getPayoutRequest,
};
