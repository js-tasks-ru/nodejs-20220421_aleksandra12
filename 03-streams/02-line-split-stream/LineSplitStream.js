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
        // this.text += element; - если добавить эту строчку, тесты не проходят.
        // Почему сам символ переноса строки не нужно добавлять в финальный текст?
        // Ведь в исходном тексте он есть.
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

  // Из комментария выше следуюет вопрос - раз нам не нужно добавлять символ переноса в финальный текст,
  // что мешает просто разбить весь текст по символу переноса строки и запушить каждый кусочек? Вот так:
  // _transform(chunk, encoding, callback) {
  //   const textParts = chunk.toString('utf-8').split(os.EOL);
  //   textParts.forEach(element => {
  //     this.push(element);
  //   });
  //   callback();
  // }
}

module.exports = LineSplitStream;
