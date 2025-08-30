const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const {
  partnerServices,
  walletService,
  promotionService,
  transactionService,
} = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");
const { addTranslatedLocale } = require("../utils/addTranslatedLocale");

const updatePartner = catchAsync(async (req, res) => {
  req.body.targetLang = req.targetLang;
  const partner = await partnerServices.updateUserById(
    req.params.partnerId,
    req.body
  );

  res.send(partner);
});

const getPartners = catchAsync(async (req, res) => {
  let filter = pick(req.query, ["isActive", "search", "raw"]);
  let result;
  if (filter.raw) {
    result = await partnerServices.getRawPartners();
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
    const options = pick(req.query, ["sortBy", "limit", "page"]);
    result = await partnerServices.queryUsers(filter, options);
  }
  res.send(result);
});

const getPartner = catchAsync(async (req, res) => {
  const partner = await partnerServices.getUserById(req.params.partnerId);
  if (!partner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }
  res.send(partner);
});

const deletePartner = catchAsync(async (req, res) => {
  await partnerServices.deleteUserById(req.params.partnerId);
  res.status(httpStatus.NO_CONTENT).send();
});

const addPaymentDetails = catchAsync(async (req, res) => {
  const { partnerId } = req.body;
  const partner = await partnerServices.deleteUserById(partnerId);
  if (!partner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found1");
  }
  const wallet = await walletService.addWalletPaymentDetails(req.body);
  res
    .status(httpStatus.NO_CONTENT)
    .send({ message: "Payments Details added successfully!" });
});

const updatePaymentDetails = catchAsync(async (req, res) => {
  const { partnerId } = req.params;
  const partner = await partnerServices.getUserById(partnerId);
  if (!partner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found!");
  }
  const wallet = await walletService.updatePartnerWallet(partnerId, req.body);
  res
    .status(httpStatus.NO_CONTENT)
    .send({ message: "Payments Details updated successfully!" });
});

const getPartnerWallet = catchAsync(async (req, res) => {
  const { partnerId } = req.params;
  const partner = await partnerServices.getUserById(partnerId);
  if (!partner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found!");
  }
  const wallet = await walletService.getWalletPartnerId(partnerId, "partner");
  res.status(httpStatus.OK).send(wallet);
});
const createPartner = catchAsync(async (req, res) => {
  req.body.targetLang = req.targetLang;
  const translateData = await addTranslatedLocale(req.body, [
    "firstName",
    "lastName",
  ]);
  const customer = await partnerServices.createUser(translateData, "admin");
  res.status(httpStatus.OK).send(customer);
});

const getOffersStatsCount = catchAsync(async (req, res) => {
  const { startDate, endDate } = pick(req.query, ["startDate", "endDate"]);
  const promotionId = req.user.offers?.[0];
  const stats = await promotionService.getOfferStatisticsCount(
    promotionId,
    startDate,
    endDate
  );
  if (!stats)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error while fetching the stats"
    );

  res.send(stats);
});

const getOffersYearlyStats = catchAsync(async (req, res) => {
  const promotionId = req.user.offers?.[0];
  const { year } = pick(req.query, ["year"]);
  const stats = await promotionService.getOfferYearlyStats(promotionId, year);

  if (!stats)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error while fetching the stats"
    );

  res.send(stats);
});

const getOffersYearlyRevenueStats = catchAsync(async (req, res) => {
  const promotionId = req.user.offers?.[0];
  const { year } = pick(req.query, ["year"]);
  const stats = await transactionService.getPromotionRevenueByAmountRange(
    promotionId,
    year
  );
  if (!stats)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error while fetching the stats"
    );

  res.send(stats);
});

const getAppDashboardStats = catchAsync(async (req, res) => {
  const data = await promotionService.getAppDashboardData(
    req.user.id,
    req.query.period
  );
  res.status(httpStatus.OK).send(data);
});
module.exports = {
  updatePartner,
  getPartners,
  getPartner,
  deletePartner,
  addPaymentDetails,
  updatePaymentDetails,
  getPartnerWallet,
  createPartner,
  getOffersStatsCount,
  getOffersYearlyStats,
  getOffersYearlyRevenueStats,
  getAppDashboardStats,
};
