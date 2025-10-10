const { Transform } = require('stream');

class UppercaseTransform extends Transform {
  constructor() {
    super({ decodeStrings: false });
  }

  _transform(chunk, encoding, callback) {
    const upper = chunk.toUpperCase();
    this.push(upper);
    callback();
  }
}

module.exports = UppercaseTransform;
