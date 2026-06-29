const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/assets/logo-red.png');
const outputPath = path.join(__dirname, '../public/assets/logo-red-small.png');

sharp(inputPath)
  .resize(120, 120, { fit: 'inside' })
  .png({ compressionLevel: 9, quality: 70 })
  .toBuffer()
  .then(buffer => {
    fs.writeFileSync(outputPath, buffer);
    const b64 = buffer.toString('base64');
    console.log("Compressed Length:", b64.length);
    console.log("Start:", b64.slice(0, 100));
  })
  .catch(err => {
    console.error("Error:", err);
  });
