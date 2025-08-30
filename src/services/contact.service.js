const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const Contact = require("../models/contact.model");
const { notificationDotForContact } = require("../sockets");

const contactUs = async (contactData) => {
  const contact = await Contact.create(contactData);
  if (!contact) {
    throw new ApiError(500, "Something went wrong");
  }
  // notificationDotForContact();
  return contact;
};
const getContactForms = async (filters, options) => {
  const contact = await Contact.paginate(filters, options);
  return contact;
};

const getContactUsById = async (contactId) => {
  const contact = await Contact.findById(contactId);
  return contact;
};
module.exports = {
  contactUs,
  getContactForms,
  getContactUsById,
};
