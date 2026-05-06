const fs = require('fs');
const https = require('https');
const path = require('path');

// Create models directory
const modelsDir = path.join(__dirname, 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir);
}

// Face API model files to download
const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1'
];

const baseUrl = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/';

console.log('Downloading face-api.js models...');

models.forEach(model => {
  const url = baseUrl + model;
  const filePath = path.join(modelsDir, model);

  https.get(url, (res) => {
    const fileStream = fs.createWriteStream(filePath);
    res.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded: ${model}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${model}:`, err.message);
  });
});

console.log('Models download initiated. This may take a few moments...');