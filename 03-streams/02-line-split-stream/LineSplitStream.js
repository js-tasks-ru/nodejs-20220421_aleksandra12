const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.text = '';
  }

  _transform(chunk, encoding, callback) {
    const letters = chunk.toString('utf-8').replaceAll(os.EOL, '\n').split('');
    letters.forEach(element => {
      if (element === '\n') {
        this.push(this.text);
        this.text = '';
      } else {
        this.text += element;
      }
    });
    callback();
  }

  _flush(callback) {
    callback(null, this.text);
  }
}

module.exports = LineSplitStream;
