const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const uploadImages = catchAsync(async (req, res) => {
  const files = req.files;
  if (!files) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Images uploading failed");
  }
  const responseData = files.map((file) => ({
    originalName: file.originalname,
    location: file.location,
    key: file.key,
  }));
  res.status(httpStatus.OK).send(responseData);
});

module.exports = {
  uploadImages,
};
