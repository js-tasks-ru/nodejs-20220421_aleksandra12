const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.size = 0;
    this.limit = options.limit;
  }

  _transform(chunk, encoding, callback) {
    const { size, limit } = this;
    this.size = size + Buffer.byteLength(chunk);
    if (this.size <= limit) {
      callback(null, chunk);
    } else {
      callback(new LimitExceededError());
    }
  }
}

module.exports = LimitSizeStream;
