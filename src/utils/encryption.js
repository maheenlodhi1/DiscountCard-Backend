const crypto = require("crypto");
const config = require("../config/config");
const encryptionKey = Buffer.from(config.encryptionKey, "hex");
const ivLength = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function encryptObject(obj) {
  const encryptedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      encryptedObj[key] = encrypt(obj[key]);
    }
  }
  return encryptedObj;
}

function decryptObject(obj) {
  const decryptedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      decryptedObj[key] = decrypt(obj[key]);
    }
  }
  return decryptedObj;
}
const getEncryptedPayoutDetailsObject = (data) => {
  const encryptedFields = [
    "name",
    "phoneNo",
    "accountNumber",
    "iban",
    "beneficiaryName",
    "bankName",
    "type",
  ];
  const encryptedData = {};

  encryptedFields.forEach((field) => {
    if (data[field]) {
      encryptedData[field] = data[field];
    }
  });
  return encryptedData;
};
module.exports = {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  getEncryptedPayoutDetailsObject,
};
