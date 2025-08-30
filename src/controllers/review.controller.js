const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { ReviewService, promotionService } = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");
const { addTranslatedLocale } = require("../utils/addTranslatedLocale");

const createReview = catchAsync(async (req, res) => {
  req.body.targetLang = req.targetLang;
  const translateData = await addTranslatedLocale(req.body, [
    "categoryName",
    "comment",
  ]);
  const review = await ReviewService.createReview(translateData);
  await promotionService.addReviewToPromotion(req.body.promotion, review.id);

  res.send(review);
});

const updateReview = catchAsync(async (req, res) => {
  req.body.targetLang = req.targetLang;
  const review = await ReviewService.updateReview(
    req.params.reviewId,
    req.body
  );
  res.send(review);
});

const getCustomerReviews = catchAsync(async (req, res) => {
  let filter = pick(req.query, ["search"]);
  if (filter.search) {
    let searchQuery = searchQueryConverter(filter.search);
    filter = {
      ...filter,
      ...searchQuery,
    };
    delete filter["search"];
  }
  filter.isDeleted = false;
  filter.customer = req.params.customerId;
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  Object.assign(options, {
    populate: "promotion-title locations categoryName locale",
  });
  const result = await ReviewService.getReviews(filter, options);
  res.send(result);
});

const deleteReview = catchAsync(async (req, res) => {
  await ReviewService.deleteReview(req.params.reviewId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createReview,
  updateReview,
  getCustomerReviews,
  deleteReview,
};
