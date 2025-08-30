const adminService = require("../services/adminUser.service");
const customerServices = require("../services/customer.service");
const partnerServices = require("../services/partner.service");
async function getUserService(type) {
  switch (type) {
    case "partner":
      return partnerServices;
    case "customer":
      return customerServices;
    case "admin":
      return adminService;
    default:
      throw new Error("Invalid service type");
  }
}

module.exports = getUserService;
