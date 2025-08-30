const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService, contactService, emailService } = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");

const contactUs = catchAsync(async (req, res) => {
  let payload = req.body;
  if (req.user) {
    const { id, phoneNo, firstName, lastName, email } = req.user;
    payload = {
      user: id,
      phoneNo,
      fullName: `${firstName} ${lastName}`,
      email,
      type: "SUBSCRIPTION INQUIRY",
      ...payload,
    };
  }
  const contact = await contactService.contactUs(payload);
  res.send(contact);
});

const getContactsForms = catchAsync(async (req, res) => {
  let filter = pick(req.query, ["search"]);
  if (filter.search) {
    let searchQuery = searchQueryConverter(filter.search);
    filter = {
      ...filter,
      ...searchQuery,
    };
    delete filter["search"];
  }
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const contacts = await contactService.getContactForms(filter, options);
  if (!contacts) {
    throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong");
  }
  res.send(contacts);
});
const emailContactUs = catchAsync(async (req, res) => {
  const userDetails = req.user;
  await emailService.sendContactUsEmail(userDetails, req.body);
  res.status(httpStatus.OK).send("Success");
});

const getContactUsById = catchAsync(async (req, res) => {
  const contactDetail = await contactService.getContactUsById(
    req.params.contactId
  );
  if (!contactDetail) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  res.status(httpStatus.OK).send(contactDetail);
});
module.exports = {
  contactUs,
  getContactsForms,
  emailContactUs,
  getContactUsById,
};
