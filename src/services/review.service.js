const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Review } = require("../models");
const createReview = async (reviewData) => {
  const review = await Review.create(reviewData);
  if (!review) {
    throw new ApiError(500, "Something went wrong");
  }
  return review;
};
const getReviews = async (filters, options) => {
  const review = await Review.paginate(filters, options);
  return review;
};

const getUserReviews = async (userType, userId) => {
  const reviews = Review.find({ [userType]: userId });
  if (!reviews) throw new ApiError(httpStatus.NOT_FOUND, "Reviews not found!");
  return reviews;
};

const updateReview = async (reviewId, updateBody) => {
  const review = getReviewById(reviewId);
  Object.assign(review, updateBody);
  await review.save();
};

const deleteReview = async (reviewId) => {
  const review = getReviewById(reviewId);
  await review.remove();
};

const getPromotionReviews = async (promotionId, sortBy = "newest") => {
  const sortOptions = {
    highestRated: { rating: -1 },
    lowestRated: { rating: 1 },
    newest: { date: -1 },
    oldest: { date: 1 },
  };

  const reviews = await Review.find({
    promotion: promotionId,
    isDeleted: false,
  })
    .sort(sortOptions[sortBy])
    .lean();

  if (!reviews.length) {
    return { reviews: [], ratingStats: null };
  }

  const totalReviews = reviews.length;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / totalReviews;

  const ratingBreakdown = [1, 2, 3, 4, 5].map((star) => ({
    star,
    percentage:
      (reviews.filter((review) => review.rating === star).length /
        totalReviews) *
      100,
  }));

  return {
    reviews,
    ratingStats: {
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(2)),
      ratingBreakdown,
    },
  };
};

module.exports = {
  createReview,
  getReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getPromotionReviews,
};
