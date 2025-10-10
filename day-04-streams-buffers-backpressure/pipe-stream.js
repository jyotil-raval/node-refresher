const fs = require('fs');
const UppercaseTransform = require('./transform-stream');

const readStream = fs.createReadStream('./input.txt', { encoding: 'utf-8' });
const transformStream = new UppercaseTransform();
const writeStream = fs.createWriteStream('./output.txt');

readStream
  .pipe(transformStream)
  .pipe(writeStream)
  .on('finish', () => console.log('Pipeline complete ✅'));
