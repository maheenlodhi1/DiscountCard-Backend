const crypto = require("crypto");

function generateSecureCouponCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let couponCode = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % characters.length;
    couponCode += characters[randomIndex];
  }
  return couponCode;
}

module.exports = { generateSecureCouponCode };
