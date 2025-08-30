const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { transactionService } = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");
const { emitReviewEvent } = require("../sockets");

const getTransactions = catchAsync(async (req, res) => {
  const { customerId, partnerId } = req.params;
  let filter = pick(req.query, ["search", "customer", "partner", "raw"]);
  if (filter.raw) {
    delete filter["raw"];
    result = await transactionService.getRawTransactions(filter);
  } else {
    if (filter.search) {
      let searchQuery = searchQueryConverter(filter.search, "$or", [
        "customer.firstName",
        "partner.firstName",
      ]);
      filter = {
        ...filter,
        ...searchQuery,
      };
      delete filter["search"];
    }
    const options = pick(req.query, ["sortBy", "limit", "page"]);
    Object.assign(options, {
      populate: "promotionId-locale locations,partner-firstName",
    });
    if (customerId) {
      filter.customer = customerId;
      Object.assign(options, {
        populate:
          "promotionId-locale locations discount id,partner-businessName photoUrl",
      });
    } else if (partnerId) {
      filter.partner = partnerId;
    }
    result = await transactionService.getTransactions(filter, options);
  }
  res.send(result);
});

const getTransaction = catchAsync(async (req, res) => {
  const promotion = await transactionService.getTransactionById(
    req.params.transactionId
  );
  if (!promotion) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }
  res.send(promotion);
});

module.exports = {
  getTransactions,
  getTransaction,
};
