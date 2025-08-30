const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const defaultRanges = {
  "0 - 200 AED": { count: 0, fill: "#A9DEFF" },
  "200 - 500 AED": { count: 0, fill: "#AEF353" },
  "500+ AED": { count: 0, fill: "#FFBF5D" },
};

module.exports = {
  monthNames,
  defaultRanges,
};
