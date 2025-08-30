const {
  BankDetails,
  AlansariDetails,
} = require("../models/usersPayoutDetail.model");
function getPayoutMethod(type) {
  switch (type) {
    case "alansari":
      return AlansariDetails;
    case "bank":
      return BankDetails;
    default:
      throw new Error("Invalid Payout method type");
  }
}

module.exports = getPayoutMethod;
