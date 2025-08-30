const mongoose = require("mongoose");

function searchQueryConverter(
  searchParam,
  operator = "$or",
  searchAttributes = []
) {
  let searchData = "";
  try {
    searchData = JSON.parse(searchParam);
  } catch (error) {
    searchData = searchParam;
  }
  let filterArray = [];
  if (typeof searchData === "string") {
    searchAttributes.forEach((attribute) => {
      filterArray.push({
        [attribute]: { $regex: new RegExp(`.*${searchData}.*`, "i") },
      });
    });
  } else if (typeof searchData === "object") {
    try {
      Object.keys(searchData).forEach((key) => {
        if (searchAttributes.includes(key)) {
          filterArray.push({
            [key]: { $regex: new RegExp(`.*${searchData[key]}.*`, "i") },
          });
        }
      });
    } catch (error) {
      throw new Error("Invalid Search object");
    }
  }

  return filterArray.length ? { [operator]: filterArray } : {};
}

module.exports = {
  searchQueryConverter,
};
