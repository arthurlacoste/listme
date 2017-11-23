const express = require('express');
const bodyParser = require('body-parser');
const ddg = require('ddg');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const shortid = require('shortid');
const md5 = require('md5');
const liststate = require('./liststate');

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
	res.json({message: 'Nothing here ! try /help'});
})

/**
* @api {post} /add_newlist Add a new list
* @apiExample {curl} Example usage:
*     curl -d "item=NewItem" -X POST  http://localhost:1337/add_newlist
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
*   "label": "Mato",
*   "value": 1,
*   "check": false,
*   "votes": {
*     "daed2ea711207043e266357feaf23399": 1
*   },
*   "key": "2",
*   "up": true,
*   "down": false
* }
*
*/

.post('/add_newlist', (req, res) => {
	if (!req.body.item) {
		res.status(500);
		return res.json({error: 'No item given'});
	}
	const id = shortid.generate();
	const adapter = new FileAsync(`${__dirname}/../db/items/${id}.db.json`);

	const ip = res.locals.ip;

	let list = {
		id,
		ip,
		items: [{
			label: req.body.item,
			value: 1,
			check: false,
			votes: {
				[ip]: 1
			}
		}]
	};
	list = liststate(list, ip);

	low(adapter).then(db => {
		db.defaults(list).write();
		res.json(list);
	});
})

/**
* @api {post} /add/:listid Add an item to a list
* @apiExample {curl} Example usage:
*     curl -d "item=NewItem" -X POST  http://localhost:1337/add/ryVlDRZxM
*
* @apiName Add item
* @apiGroup List
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
*   "label": "Mato",
*   "value": 1,
*   "check": false,
*   "votes": {
*     "daed2ea711207043e266357feaf23399": 1
*   },
*   "key": "2",
*   "up": true,
*   "down": false
* }
*
*/

.post('/add/:listid', (req, res) => {
	if (!req.params.listid || !req.body.item) {
		res.status(500);
		return res.json({error: 'No item given'});
	}

	const adapter = new FileAsync(`${__dirname}/../db/items/${req.params.listid}.db.json`);
	const ip = res.locals.ip;

	const item = {
		label: req.body.item,
		value: 1,
		check: false,
		votes: {
			[ip]: 1
		}
	};

	low(adapter).then(db => {
		let list = db.getState();
		list.items.push(item);
		list = liststate(list, ip);
		db.setState(list).write().then(() => res.json(list));
	});
})

/**
* @api {get} /vote/:listid/:itemid/:vote Vote to an item of a list
* @apiExample {curl} Example usage:
*     curl -i  http://localhost:1337/vote/ryVlDRZxM/0/1
*
* @apiName Send vote for an item
* @apiGroup List
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
*   "label": "Mato",
*   "value": 1,
*   "check": false,
*   "votes": {
*     "daed2ea711207043e266357feaf23399": 1
*   },
*   "key": "2",
*   "up": true,
*   "down": false
* }
*
*/

.get('/vote/:listid/:itemid/:vote', (req, res) => {
	if (!req.params.listid || !req.params.vote) {
		res.status(500);
		return res.json({error: 'No item given'});
	}
	const listid = req.params.listid.toString();
	const itemid = req.params.itemid;
	const adapter = new FileAsync(`${__dirname}/../db/items/${listid}.db.json`);
	const ip = res.locals.ip;
	const vote = (req.params.vote === '1') ? 1 : -1;

	low(adapter).then(db => {
		let list = db.getState();
		list.items[itemid].votes[ip] = vote;
		list = liststate(list, ip);
		db.setState(list).write().then(() => res.json(list));
	});
})

/**
* @api {get} /get/:listid Get list
* @apiExample {curl} Example usage:
*     curl -i  http://localhost:1337/get/ryVlDRZxM
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
*   "label": "Mato",
*   "value": 1,
*   "check": false,
*   "votes": {
*     "daed2ea711207043e266357feaf23399": 1
*   },
*   "key": "2",
*   "up": true,
*   "down": false
* }
*
*/

.get('/get/:listid', (req, res) => {
	if (!req.params.listid) {
		res.status(500);
		return res.json({error: 'No item given'});
	}
	const listid = req.params.listid.toString();
	const adapter = new FileAsync(`${__dirname}/../db/items/${listid}.db.json`);
	const ip = res.locals.ip;

	low(adapter).then(db => {
		let list = db.getState();
		list = liststate(list, ip);
		res.json(list);
	});
})

// Get all results from duckduckgo

.get('/ddg/:item', (req, res) => {
	const item = req.params.item.toString();

	const options = {
		useragent: 'listJS',
		no_redirects: '1', // eslint-disable-line camelcase
		format: 'json'
	};

	ddg.query(item, options, (err, data) => {
		if (err) {
			res.status(500);
			return res.json({error: err});
		}
		res.json(data);
	});
})

.listen(port, () => {
	console.log('Listening on http://localhost:' + port);
});
