const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { adSPopupService } = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");
const { addTranslatedLocale } = require("../utils/addTranslatedLocale");

const createPopupAd = catchAsync(async (req, res) => {
  req.body.targetLang = req.targetLang;
  const translateData = await addTranslatedLocale(req.body, [
    "title",
    "description",
  ]);
  const adPopup = await adSPopupService.createPopupAd(translateData);

  res.send(adPopup);
});

const updatePopupAd = catchAsync(async (req, res) => {
  req.body.targetLang = req.targetLang;
  const adPopup = await adSPopupService.updatePopupAd(
    req.params.adId,
    req.body
  );
  res.send(adPopup);
});

const getPopupAds = catchAsync(async (req, res) => {
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
  // Object.assign(options, {
  //   populate: "promotion-title locations categoryName locale",
  // });
  const result = await adSPopupService.getPopupAds(filter, options);
  res.send(result);
});

const getPopupAdById = catchAsync(async (req, res) => {
  const popupAd = await adSPopupService.getPopupAdById(req.params.adId);
  res.status(httpStatus.OK).send(popupAd);
});
const deletePopupAd = catchAsync(async (req, res) => {
  await adSPopupService.deletePopupAd(req.params.adId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getPopupAd = catchAsync(async (req, res) => {
  const popupAd = await adSPopupService.getPopupAd();
  res.status(httpStatus.OK).send(popupAd);
});

module.exports = {
  createPopupAd,
  updatePopupAd,
  getPopupAds,
  deletePopupAd,
  getPopupAd,
  getPopupAdById,
};
