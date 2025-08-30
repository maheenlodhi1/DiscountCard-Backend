const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { CategoryService, promotionService } = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");

const getHomeData = catchAsync(async (req, res) => {
  const { type } = pick(req.query, ["type"]);

  let data;
  const today = new Date();
  const tenDaysFromNow = new Date();
  tenDaysFromNow.setDate(today.getDate() + 10);

  switch (type) {
    case "categories":
      data = await CategoryService.getRawCategoriesWithOfferCount();
      break;

    case "featured":
      data = await promotionService.getRawPromotions({
        isFeatured: true,
        isActive: true,
        isDeleted: false,
      });
      break;

    case "recent":
      data = await promotionService.getRawPromotions(
        { isActive: true, isDeleted: false },
        { createdAt: -1 }
      );
      break;

    case "expire-soon":
      data = await promotionService.getRawPromotions({
        isActive: true,
        isDeleted: false,
        expiryDate: {
          $gte: today,
          $lte: tenDaysFromNow,
        },
      });
      break;

    case "top-rated":
      data = await promotionService.getTopRatedPromotions();
      break;

    default:
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Invalid type parameter" });
  }

  res.status(httpStatus.OK).json(data);
});

const nearbyOffers = catchAsync(async (req, res) => {
  let query = pick(req.query, ["location"]);
  const promotions = await promotionService.findNearByOffers(
    JSON.parse(query.location)
  );
  if (!promotions) {
    throw new ApiError(httpStatus.NOT_FOUND, "No nearby Offers found!");
  }
  res.status(httpStatus.OK).send(promotions);
});

const searchOffers = catchAsync(async (req, res) => {
  let query = pick(req.query, ["categoryName", "text"]);
  if (query.text) {
    query.title = query.text;
    delete query["text"];
  }
  let searchParam = searchQueryConverter(JSON.stringify(query), "$and");
  searchParam.isActive = true;
  searchParam.isDeleted = false;
  const promotions = await promotionService.searchPromotions(searchParam);
  if (!promotions) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Offers found!");
  }
  res.status(httpStatus.OK).send(promotions);
});

module.exports = {
  getHomeData,
  nearbyOffers,
  searchOffers,
};
