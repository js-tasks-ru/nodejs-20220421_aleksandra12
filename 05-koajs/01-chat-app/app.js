const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

router.get('/subscribe', async (ctx, next) => {
	await new Promise(resolve => {
		app.on('publish', (param) => {
			resolve();
			ctx.body = param;
		})
	});
	return next();	
});

router.post('/publish', async (ctx, next) => {
	if (ctx.request.body.message) {
		app.emit('publish', ctx.request.body.message);
		ctx.res.statusCode = 200;
	}
	return next();
});

app.use(router.routes());

module.exports = app;
