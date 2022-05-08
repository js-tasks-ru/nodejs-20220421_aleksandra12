const url = require('url');
const http = require('http');
const path = require('path');
const LimitSizeStream = require('./LimitSizeStream');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);
	const pathname = url.pathname.slice(1);

	const filepath = path.join(__dirname, 'files', pathname);

	switch (req.method) {
		case 'POST':
			const body = [];
			req.on('data', chunk => body.push(chunk));
			req.on('end', () => {
				try {
					if (/\//.test(pathname)) {
						res.statusCode = 400;
						res.end('nested path is not supported');
						return;
					}
					const fileContent = Buffer.concat(body).toString('utf-8');

					const limitedStream = new LimitSizeStream({
						limit: 1048576,
						encoding: 'utf-8',
					});

					fs.promises.mkdir('files', {
						recursive: true
					});

					(async () => {
						try {
							if (!pathname) {
								res.statusCode = 400;
								res.end('filename is required');
								return;
							}
							await fs.promises.access(filepath, fs.constants.F_OK)
								.then(() => {
									res.statusCode = 409;
									res.end('file already exists');
								})
						} catch {
							limitedStream.on('data', () => {
								console.log('test');
								const outStream = fs.createWriteStream(filepath);
								limitedStream.pipe(outStream);
								outStream.write(fileContent);
								outStream.on('finish', () => {
									res.statusCode = 201;
									res.end();
								});
							});
							limitedStream.write(fileContent);

							limitedStream.end();

							limitedStream.on('error', (error) => {
								if (error.code === 'LIMIT_EXCEEDED') {
									fs.rm(filepath, () => {
										res.statusCode = 413;
										res.end('file is too large');
									});
								} else {
									res.statusCode = 500;
									res.end('internal error');
								}
							});

							req.on('aborted', () => {
								limitedStream.destroy();
							});
						}
					})();
				} catch (err) {
					res.statusCode = 500;
					res.end('internal error');
				}
			});
			break;

		default:
			res.statusCode = 501;
			res.end('Not implemented');
	}
});

module.exports = server;
