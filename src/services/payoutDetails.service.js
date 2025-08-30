const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { PayoutDetails } = require("../models/usersPayoutDetail.model");
const getPayoutMethod = require("../utils/payoutMethodsFactory");
const {
  encryptObject,
  decryptObject,
  getEncryptedPayoutDetailsObject,
} = require("../utils/encryption");
const addPayoutDetails = async (type, payoutDetailsData) => {
  const payoutMethod = getPayoutMethod(type);
  const payoutDetails = await payoutMethod.create(payoutDetailsData);
  if (!payoutDetails) {
    throw new ApiError(500, "Something went wrong");
  }
  return payoutDetails;
};

const getPayoutDetails = async (filters, options) => {
  const payoutDetails = await PayoutDetails.paginate(filters, options);
  return payoutDetails;
};

const getRawPayoutDetails = async () => {
  const sortedDocs = [];
  const othersDocs = [];
  let payoutDetails = await PayoutDetails.find();
  payoutDetails.forEach((doc) => {
    if (doc.title === "Others") {
      sortedDocs.push(doc);
    } else {
      othersDocs.push(doc);
    }
  });
  payoutDetails = othersDocs.concat(sortedDocs);
  return payoutDetails;
};

const getPayoutDetailsById = async (payoutDetailsId, decrypt = false) => {
  const payoutDetails = await PayoutDetails.findById(payoutDetailsId);
  if (!payoutDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "PayoutDetails not found!");
  }
  if (decrypt) {
    const encryptedObject = getEncryptedPayoutDetailsObject(payoutDetails);
    return decryptObject(encryptedObject);
  } else return payoutDetails;
};
const updatePayoutDetails = async (payoutDetailsId, updateBody) => {
  let payoutDetails = await getPayoutDetailsById(payoutDetailsId);
  const encryptedObject = getEncryptedPayoutDetailsObject(payoutDetails);
  let decryptedObject = decryptObject(encryptedObject);

  if (decryptedObject.type != updateBody.type) {
    await deletePayoutDetails(payoutDetails.id);
    const payload = encryptObject(updateBody);
    return addPayoutDetails(updateBody.type, payload);
  }
  await payoutDetails.save();
};

const deletePayoutDetails = async (payoutDetailsId) => {
  const payoutDetails = await getPayoutDetailsById(payoutDetailsId);
  return payoutDetails.remove();
};

module.exports = {
  addPayoutDetails,
  getPayoutDetails,
  updatePayoutDetails,
  deletePayoutDetails,
  getPayoutDetailsById,
  getRawPayoutDetails,
};
