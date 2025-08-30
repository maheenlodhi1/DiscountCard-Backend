const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const moment = require("moment");
const { PromotionEvent } = require("../models");
const {
  promotionService,
  partnerServices,
  StripeServices,
  transactionService,
  emailService,
  customerServices,
  ReviewService,
  SubscriptionsServices,
} = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");
const { emitReviewEvent } = require("../sockets");
const { addTranslatedLocale } = require("../utils/addTranslatedLocale");

const createPromotion = catchAsync(async (req, res) => {
  req.body.targetLang = req.targetLang;
  const subscription = await SubscriptionsServices.findSubscriptionByUserId(
    req.body.partner
  );
  const translateData = await addTranslatedLocale(req.body, [
    "title",
    "categoryName",
    "description",
  ]);

  const promotion = await promotionService.createPromotion(translateData);
  const partner = await partnerServices.updateUserById(req.body.partner, {
    offers: [promotion.id],
  });

  if (req.user.userType != "admin") {
    await emailService.sendOfferCreationEmail({
      businessName: partner.businessName,
      partnerName: `${partner.firstName} ${partner.lastName}`,
      partnerEmail: partner.email,
      offerTitle: promotion.title,
      offerCategory: promotion.categoryName,
      offerDiscount: promotion.discount,
    });
  }

  res.status(httpStatus.OK).send(promotion);
});

const updatePromotion = catchAsync(async (req, res) => {
  req.body.targetLang = req.targetLang;
  const { promotionStatus, isActive } = req.body;
  let payload = req.body;
  if (isActive && req.user.userType === "admin") {
    payload["promotionStatus"] = "active";
    payload["isApproved"] = true;
  }
  const promotion = await promotionService.updatePromotion(
    req.params.promotionId,
    req.body
  );
  if (
    !promotionStatus &&
    req.user.userType == "partner" &&
    promotion.promotionStatus == "rejected"
  ) {
    promotion.promotionStatus = "pending";
    await promotion.save();
  }
  if (promotionStatus === "rejected") {
    const partner = await partnerServices.getUserById(promotion.partner);
    await emailService.sendOfferNotification(partner.email, {
      promotionStatus: promotion.promotionStatus,
    });
  }
  res.send(promotion);
});

const getPromotions = catchAsync(async (req, res) => {
  let filter = pick(req.query, [
    "isActive",
    "role",
    "promotionStatus",
    "search",
    "categoryName",
    "type",
    "raw",
  ]);
  let result;
  if (filter.raw) {
    result = await promotionService.getReportPromotions();
  } else {
    let typeOptions = {};
    if (filter.type) {
      let typeQuery = getPromotionTypeFilter(filter.type, typeOptions);
      filter = {
        ...filter,
        ...typeQuery,
      };
      delete filter["type"];
    }
    if (filter.search) {
      let searchQuery = searchQueryConverter(filter.search, "$or", [
        "title",
        "categoryName",
      ]);
      filter = {
        ...filter,
        ...searchQuery,
      };
      delete filter["search"];
    }
    if (!!req.user) filter.isActive = true;
    filter.isDeleted = false;

    let options = pick(req.query, ["sortBy", "limit", "page"]);
    Object.assign(options, typeOptions);
    Object.assign(options, {
      populate: "partner-locale",
    });
    result = await promotionService.getPromotions(filter, options);
  }

  res.status(httpStatus.OK).send(result);
});

const getPromotion = catchAsync(async (req, res) => {
  const promotion = await promotionService.getPromotionById(
    req.params.promotionId
  );

  if (!promotion) {
    throw new ApiError(httpStatus.NOT_FOUND, "Promotion not found");
  }
  if (!req.user || req.user.userType == "customer") {
    await promotionService.updatePromotionViewOrOrders(promotion.id, "views");
  }
  res.status(httpStatus.OK).send(promotion);
});

const deletePromotion = catchAsync(async (req, res) => {
  const promotion = await promotionService.deletePromotion(
    req.params.promotionId
  );
  await partnerServices.removeOffer(promotion.id, promotion.partner);
  res.status(httpStatus.NO_CONTENT).send();
});

const createPromotionInvoice = catchAsync(async (req, res) => {
  const session = await StripeServices.createInvoiceLink(req.body);
  res.status(httpStatus.NO_CONTENT).send("Invoice created successfully!");
});

const redeemOffer = catchAsync(async (req, res) => {
  const { promotionId } = req.params;
  const { partner, totalBill, customer } = req.body;
  const partnerData = await partnerServices.getUserById(partner);

  if (!partnerData)
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found!");
  else if (partnerData.offers.length < 1)
    throw new ApiError(httpStatus.NOT_FOUND, "You have no offer to redeem!");
  await partnerData.populate("offers");
  const totalSavings = Math.round(
    totalBill * (partnerData.offers[0].discount / 100)
  );
  const discountPrice = Math.round(totalBill - totalSavings);
  const bill = Math.round(totalBill);
  const payload = {
    customer,
    partner,
    promotionId,
    totalBill: bill,
    discountPrice,
    totalSavings,
    offerDiscount: partnerData.offers[0].discount,
    offerExpiryDate: partnerData.offers[0].expiryDate,
  };
  const transaction = await transactionService.addTransaction(payload);
  await promotionService.updatePromotionViewOrOrders(promotionId, "orders");
  emitReviewEvent({ promotionId, customer, partner });
  const customerData = await customerServices.getUserById(customer, false);
  const now = moment();
  const date = now.format("MMMM Do YYYY, h:mm:ss a");
  emailService.sendOfferRedeemCustomerNotification(customerData.email, {
    offerName: partnerData.offers[0].title,
    businessName: partnerData.businessName,
    discount: partnerData.offers[0].discount,
    totalBill,
    discountedBill: discountPrice,
    savings: totalSavings,
  });
  emailService.sendOfferRedeemPartnerNotification(partnerData.email, {
    offerName: partnerData.offers[0].title,
    customerName: `${customerData.firstName} ${customerData.lastName}`,
    date,
    totalBill,
    discount: partnerData.offers[0].discount,
    discountedBill: discountPrice,
  });
  res.status(httpStatus.NO_CONTENT).send("Offer redeemed successfully");
});

const getPromotionTypeFilter = (type, options) => {
  const today = new Date();
  const tenDaysFromNow = new Date();
  tenDaysFromNow.setDate(today.getDate() - 10);

  switch (type) {
    case "featured":
      return { isFeatured: true };
    case "recent":
      options.sortBy = "createdAt:desc";
      return {
        createdAt: {
          $gte: tenDaysFromNow,
          $lte: today,
        },
      };
    case "expirySoon":
      return {
        expiryDate: {
          $gte: today,
          $lte: tenDaysFromNow,
        },
      };
    case "topRated":
      options.sortBy = "reviews:desc,averageRating:desc";
      return undefined;
    default:
      undefined;
  }
};

const getPartnerPromotions = catchAsync(async (req, res) => {
  const promotions = await promotionService.getPartnerPromotions(req.user.id);
  res.status(httpStatus.OK).send(promotions);
});

const getPromotionReviews = catchAsync(async (req, res) => {
  const promotions = await ReviewService.getPromotionReviews(
    req.params.promotionId
  );
  res.status(httpStatus.OK).send(promotions);
});

const createPromotionEvents = catchAsync(async (req, res) => {
  const {
    userId: bodyUserId,
    promotionId,
    categoryName,
    eventType,
    timestamp,
    source = "app",
    location,
  } = req.body || {};

  const userId = req.user?.id || bodyUserId;

  if (!promotionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "promotionId is required");
  }
  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "userId is required");
  }
  if (!["view", "click", "redeem"].includes(eventType)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid eventType");
  }

  const doc = {
    userId,
    promotionId,
    categoryName,
    eventType,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    source,
  };

  // Normalize optional GeoJSON point
  if (
    location?.coordinates &&
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2
  ) {
    doc.location = {
      type: "Point",
      coordinates: [
        Number(location.coordinates[0]), // lng
        Number(location.coordinates[1]), // lat
      ],
    };
  }

  const created = await PromotionEvent.create(doc);

  // Optional: keep aggregate counters in Promotions collection in sync
  // try {
  //   if (eventType === "view") {
  //     await promotionService.updatePromotionViewOrOrders(promotionId, "views");
  //   } else if (eventType === "redeem") {
  //     await promotionService.updatePromotionViewOrOrders(promotionId, "orders");
  //   }
  // } catch (e) {
  //   // don't fail the request if counters update fails
  // }

  return res.status(httpStatus.CREATED).send(created);
});

const getPromotionEvents = catchAsync(async (req, res) => {
  const result = await promotionService.getPromotionEvents(req.query);
  return res.status(httpStatus.OK).send(result);
});

module.exports = {
  createPromotion,
  updatePromotion,
  getPromotions,
  getPromotion,
  deletePromotion,
  createPromotionInvoice,
  redeemOffer,
  getPartnerPromotions,
  getPromotionReviews,
  createPromotionEvents,
  getPromotionEvents,
};
