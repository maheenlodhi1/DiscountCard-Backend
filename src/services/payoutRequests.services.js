const httpStatus = require("http-status");
const { PayoutRequests } = require("../models");
const ApiError = require("../utils/ApiError");
const { encryptObject } = require("../utils/encryption");

const createPayoutRequest = async (data) => {
  const payoutRequest = await PayoutRequests.create(data);
  if (!payoutRequest) {
    throw new Error("something went wrong");
  }
  return payoutRequest;
};
const getPayoutRequests = async (filters, options) => {
  const request = await PayoutRequests.paginate(filters, options);
  return request;
};

const getPayoutRequestsById = async (id, lean = false) => {
  let query = PayoutRequests.findById(id).populate("accountId");

  if (lean) {
    query = query.lean();
  }

  const payoutRequest = await query;

  if (!payoutRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payout Request Data not found");
  }

  return payoutRequest;
};
const updatePayoutRequest = async (requestId, updateBody) => {
  const request = await getPayoutRequestsById(requestId);
  Object.assign(request, updateBody);
  await request.save();
};

const deletePayoutRequest = async (requestId) => {
  const request = getPayoutRequestsById(requestId);

  await request.remove();
};

module.exports = {
  createPayoutRequest,
  getPayoutRequests,
  updatePayoutRequest,
  deletePayoutRequest,
  getPayoutRequestsById,
};
