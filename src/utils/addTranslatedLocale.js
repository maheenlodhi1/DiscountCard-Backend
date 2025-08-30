const { translateText } = require("./translateText");

const addTranslatedLocale = async (object, keys) => {
  const targetLang = object.targetLang || "ar";
  const toLang = (targetLang || "ar") === "ar" ? "en" : "ar";

  object.locale = {
    [targetLang]: {},
    [toLang]: {},
  };

  for (const key of keys) {
    if (object[key]) {
      object.locale[toLang][key] = await translateText(object[key], toLang);
      object.locale[targetLang][key] = object[key];
    }
  }
  delete object["targetLang"];
  return object;
};

module.exports = { addTranslatedLocale };
