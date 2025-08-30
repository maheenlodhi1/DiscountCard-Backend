const barcode = require("jsbarcode");
const { XMLSerializer, DOMImplementation } = require("xmldom");
const generateBarcode = async (barcodeId) => {
  const xmlSerializer = new XMLSerializer();
  const document = new DOMImplementation().createDocument(
    "http://www.w3.org/1999/xhtml",
    "html",
    null
  );
  const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  barcode(svgNode, barcodeId, {
    xmlDocument: document,
    height: 40,
  });

  const svgText = xmlSerializer.serializeToString(svgNode);
  return svgText;
};

module.exports = {
  generateBarcode,
};
