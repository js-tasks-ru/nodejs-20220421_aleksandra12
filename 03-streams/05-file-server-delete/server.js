const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);
	const pathname = url.pathname.slice(1);

	const filepath = path.join(__dirname, 'files', pathname);

	switch (req.method) {
		case 'DELETE':
			if (/\//.test(pathname)) {
				res.statusCode = 400;
				res.end('nested path is not supported');
				return;
			}
			fs.rm(filepath, (err) => {
				if (err) {
					if (err.code === 'ENOENT') {
						res.statusCode = 404;
						res.end('file not found');
						return;
					}
					res.statusCode = 500;
					res.end('internal error');
					return;
				}
				res.statusCode = 200;
				res.end('ok');
			});
			break;
		default:
			res.statusCode = 501;
			res.end('Not implemented');
	}
});

module.exports = server;
