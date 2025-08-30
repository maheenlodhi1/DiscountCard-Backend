const config = require("../config/config");
const getLogger = require("../config/logger");
const logger = getLogger("TranslateUtil");

const { Translate } = require("@google-cloud/translate").v2;
const translate = new Translate({ key: config.google_cloud_api_key });

async function translateText(text, target) {
  try {
    const [translation] = await translate.translate(text, target);
    return translation;
  } catch (error) {
    logger.info(`Error while translating the response ${error}`);
  }
}

module.exports = { translateText };
