const express = require('express');
const bodyParser = require('body-parser');
const md5 = require('md5');
const api = require('./apicore');
const {to} = require('await-to-js');

const app = express();
const port = process.env.PORT || 1337;

app.set('trust proxy', '9.9.9.9');

app.use((req, res, next) => {
	let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (ip.substr(0, 7) === '::ffff:') {
		ip = ip.substr(7);
	}
	res.locals.ip = md5(ip + 'JE5G%$>b|2kV:1!(U&O');
	next();
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

app.get('/', (req, res) => {
	res.json({message: 'Nothing here !'});
})

/**
* @api {post} /add/newlist Add a new list
* @apiExample {curl} Example usage:
*     curl -d "item=NewItem" -X POST  https://localhost:1337/add/newlist
*
* @apiName Add new list
* @apiGroup List
*
* @apiParam {Number} item Item to add into the list
*
* @apiSuccess {Object} list Item list
*
* @apiSuccessExample Success-Response:
*
* HTTP/1.1 200 OK
* {
*     "id": "HkFuKaBlz",
*     "ip": "5163cfea8f004a33914db5b4509f9b57",
*     "items": [
*         {
*             "label": "item",
*             "value": 1,
*             "check": false,
*             "votes": {
*                 "5163cfea8f004a33914db5b4509f9b57": 1
*             },
*             "key": "0",
*             "up": false,
*             "down": false
*         }
*     ],
*     "currentip": "ec2a229c636db8e9db211573d9ac6f0d"
* }
*
*/

.post('/add/newlist', async (req, res) => {
	let err, list;
	[err, list] = await to(api.addNewList(req, res));

	if (err) {
		res.status(500);
		return res.json({error: err});
	}
	return res.json(list);
})

/**
* @api {post} /add/attr/:listid/:itemid Add attributes
* @apiExample {curl} Example usage:
*     curl -d "check=1" -X POST  https://listmeapi.irz.fr/add/attr/HkFuKaBlz/0
*
* @apiName Add attributes
* @apiGroup Item
*
* @apiParam {String} :listid List id
* @apiParam {String} :itemid Key of item
* @apiParam {Number} check Vote (1 or 0)
*
* @apiSuccess {Object} list Item list
*
* @apiSuccessExample Success-Response:
*
* HTTP/1.1 200 OK
* {
*     "id": "HkFuKaBlz",
*     "ip": "5163cfea8f004a33914db5b4509f9b57",
*     "items": [
*         {
*             "label": "item",
*             "value": 1,
*             "check": true,
*             "votes": {
*                 "5163cfea8f004a33914db5b4509f9b57": 1
*             },
*             "key": "0",
*             "up": false,
*             "down": false
*         }
*     ],
*     "currentip": "ec2a229c636db8e9db211573d9ac6f0d"
* }
*
*/

.post('/add/attr/:listid/:itemid', async (req, res) => {
	let err, list;
	[err, list] = await to(api.addAttributes(req, res));

	if (err) {
		res.status(500);
		return res.json({error: err});
	}
	return res.json(list);
})

/**
* @api {post} /add/:listid Add an item
* @apiExample {curl} Example usage:
*     curl -d "item=NewItem" -X POST  https://listmeapi.irz.fr/add/ryVlDRZxM
*
* @apiName Add item
* @apiGroup Item
*
* @apiParam {String} :listid List hash
* @apiParam {String} item item to add into the list
*
* @apiSuccess {Object} list Item list
*
* @apiSuccessExample Success-Response:
*
* HTTP/1.1 200 OK
* {
*     "id": "HkFuKaBlz",
*     "ip": "5163cfea8f004a33914db5b4509f9b57",
*     "items": [
*         {
*             "label": "item",
*             "value": 1,
*             "check": false,
*             "votes": {
*                 "5163cfea8f004a33914db5b4509f9b57": 1
*             },
*             "key": "0",
*             "up": false,
*             "down": false
*         }
*     ],
*     "currentip": "ec2a229c636db8e9db211573d9ac6f0d"
* }
*
*/

.post('/add/:listid', async (req, res) => {
	let err, list;
	[err, list] = await to(api.addItem(req, res));

	if (err) {
		res.status(500);
		return res.json({error: err});
	}
	return res.json(list);
})

/**
* @api {get} /vote/:listid/:itemid/:vote Vote
* @apiExample {curl} Example usage:
*     curl -i  https://listmeapi.irz.fr/vote/ryVlDRZxM/0/1
*
* @apiName Send vote for an item
* @apiGroup Item
*
* @apiParam {String} :listid List hash
* @apiParam {String} :itemid Key of item
* @apiParam {Number} :vote Vote (1 or 0)
*
* @apiSuccess {Object} list Item list
*
* @apiSuccessExample Success-Response:
*
* HTTP/1.1 200 OK
* {
*     "id": "HkFuKaBlz",
*     "ip": "5163cfea8f004a33914db5b4509f9b57",
*     "items": [
*         {
*             "label": "item",
*             "value": 1,
*             "check": false,
*             "votes": {
*                 "5163cfea8f004a33914db5b4509f9b57": 1
*             },
*             "key": "0",
*             "up": false,
*             "down": false
*         }
*     ],
*     "currentip": "ec2a229c636db8e9db211573d9ac6f0d"
* }
*
*/

.get('/vote/:listid/:itemid/:vote', async (req, res) => {
	let err, list;
	[err, list] = await to(api.vote(req, res));

	if (err) {
		res.status(500);
		return res.json({error: err});
	}
	return res.json(list);
})

/**
* @api {post} /settings/:listid Set settings for a list
* @apiExample {curl} Example usage:
*     curl -i  https://listmeapi.irz.fr/settings/ryVlDRZxM
*
* @apiName Set settings
* @apiGroup List
* @apiDescription You can set settings of a list if you are the owner (checked by IP).
*
* @apiParam {String} :listid List hash
* @apiParam {String} name Name of the list
* @apiParam {String} slug Change id & url of the list if he is not already taken
*
* @apiSuccess {Object} list Item list
*
* @apiSuccessExample Success-Response:
*
* HTTP/1.1 200 OK
* {
*     "id": "HkFuKaBlz",
*     "ip": "5163cfea8f004a33914db5b4509f9b57",
*     "items": [
*         {
*             "label": "item",
*             "value": 1,
*             "check": false,
*             "votes": {
*                 "5163cfea8f004a33914db5b4509f9b57": 1
*             },
*             "key": "0",
*             "up": false,
*             "down": false
*         }
*     ],
*     "currentip": "ec2a229c636db8e9db211573d9ac6f0d"
* }
*
*/

.post('/settings/:listid', async (req, res) => {
	let err, list;

	[err, list] = await to(api.setSettings(req, res));

	if (err) {
		res.status(500);
		return res.json({error: err});
	}
	return res.json(list);
})

/**
* @api {get} /get/:listid Get list
* @apiExample {curl} Example usage:
*     curl -i  https://listmeapi.irz.fr/get/ryVlDRZxM
*
* @apiName Get list
* @apiGroup List
*
* @apiParam {String} :listid List hash
*
* @apiSuccess {Object} list Item list
*
* @apiSuccessExample Success-Response:
*
* HTTP/1.1 200 OK
* {
*     "id": "HkFuKaBlz",
*     "ip": "5163cfea8f004a33914db5b4509f9b57",
*     "items": [
*         {
*             "label": "item",
*             "value": 1,
*             "check": false,
*             "votes": {
*                 "5163cfea8f004a33914db5b4509f9b57": 1
*             },
*             "key": "0",
*             "up": false,
*             "down": false
*         }
*     ],
*     "currentip": "ec2a229c636db8e9db211573d9ac6f0d"
* }
*
*/

.get('/get/:listid', async (req, res) => {
	let err, list;

	[err, list] = await to(api.getList(req, res));

	if (err) {
		res.status(500);
		return res.json({error: err});
	}
	return res.json(list);
})

.get('/ddg/:item', (req, res) => {
	api.ddgSearch(req, res, (err, list) => {
		if (err) {
			res.status(500);
			return res.json({error: err});
		}
		return res.json(list);
	});
})

.listen(port, () => {
	console.log('Listening on http://localhost:' + port);
});
