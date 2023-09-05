const Jimp = require('jimp');

const processImage = async (buffer) => {
  // Resize image and convert to Base64 string
  console.log(Jimp);
  const imageJimp = await Jimp.read(buffer);
  imageJimp.resize(20, Jimp.AUTO);
  const base64 = await imageJimp.getBase64Async(Jimp.MIME_PNG);
  return base64;
};

module.exports = { processImage };
