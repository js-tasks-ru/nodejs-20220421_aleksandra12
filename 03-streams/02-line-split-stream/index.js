const LineSplitStream = require('./LineSplitStream');
const os = require('os');
const fs = require('fs');

const lines = new LineSplitStream({
  encoding: 'utf-8',
});

const outStream = fs.createWriteStream('out.txt');

lines.pipe(outStream);

function onData(line) {
  console.log('onData');
  console.log(line);
}

lines.on('data', onData);

lines.write(`первая строка${os.EOL}вторая строка${os.EOL}третья строка${os.EOL}`);

lines.end();
