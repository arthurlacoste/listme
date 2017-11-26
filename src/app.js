const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const ddg = require('ddg');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const shortid = require('shortid');
const md5 = require('md5');
const slugme = require('slugme');
const liststate = require('./liststate');

const app = express();
const port = process.env.PORT || 1337;
const striptag = /(<([^>]+)>)/ig;

const dbpath = function (type, id) {
	return `${__dirname}/../db/${type}/${id}.db.json`;
};

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
*     curl -d "item=NewItem" -X POST  https://listmeapi.irz.fr/add_newlist
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

.post('/add_newlist', (req, res) => {
	if (!req.body.item) {
		res.status(500);
		return res.json({error: 'No item given'});
	}

	const id = shortid.generate();
	const adapter = new FileAsync(dbpath('items', id));

	const ip = res.locals.ip;

	let list = {
		id,
		ip,
		items: [{
			label: req.body.item.replace(striptag, ''),
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

.post('/add/:listid', (req, res) => {
	if (!req.params.listid || !req.body.item) {
		res.status(500);
		return res.json({error: 'No item given'});
	}
	const path = dbpath('items', req.params.listid);

	if (fs.existsSync(path)) {
    // Do something

		const adapter = new FileAsync(path);
		const ip = res.locals.ip;

		const item = {
			label: req.body.item.replace(striptag, ''),
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
	} else {
		res.status(500);
		return res.json({error: 'This list doesn\'t exist.'});
	}
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

.get('/vote/:listid/:itemid/:vote', (req, res) => {
	if (!req.params.listid || !req.params.vote) {
		res.status(500);
		return res.json({error: 'No item given'});
	}
	const path = dbpath('items', req.params.listid.toString());

	if (fs.existsSync(path)) {
		const itemid = req.params.itemid;
		const adapter = new FileAsync(path);
		const ip = res.locals.ip;
		const vote = (req.params.vote === '1') ? 1 : -1;

		low(adapter).then(db => {
			let list = db.getState();
			list.items[itemid].votes[ip] = vote;
			list = liststate(list, ip);
			db.setState(list).write().then(() => res.json(list));
		});
	} else {
		res.status(500);
		return res.json({error: 'This list doesn\'t exist.'});
	}
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

.post('/settings/:listid', (req, res) => {
	if (!req.params.listid) {
		res.status(500);
		return res.json({error: 'No item given'});
	}

	const path = dbpath('items', req.params.listid.toString());

	if (fs.existsSync(path)) {
		const adapter = new FileAsync(path);
		const ip = res.locals.ip;

		low(adapter).then(db => {
			let list = db.getState();

      // If it's owner, he can edit settings
			if (ip === list.ip) {
				if (req.body.name) {
					list.name = req.body.name;
				}

				list = liststate(list, ip);
				db.setState(list).write().then(() => {
					if (req.body.slug && req.body.slug !== list.id) {
						low(adapter).then(db => {
							const list = db.getState();
							list.id = slugme(req.body.slug);
							const newPath = dbpath('items', list.id);

							if (fs.existsSync(newPath)) {
								res.status(500);
								return res.json({error: 'This URL are already taken, try another.'});
							}
							const newAdapter = new FileAsync(newPath);
							low(newAdapter).then(db => {
								db.setState(list).write().then(() => {
									fs.unlink(path, () => {
										return res.json(list);
									});
								});
							});
						});
					} else {
						return res.json(list);
					}
				});
			} else {
				res.status(500);
				return res.json({error: 'You are not the owner of the list.'});
			}
		});
	} else {
		res.status(500);
		return res.json({error: 'This list doesn\'t exist.'});
	}
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

.get('/get/:listid', (req, res) => {
	if (!req.params.listid) {
		res.status(500);
		return res.json({error: 'No item given'});
	}
	const path = dbpath('items', req.params.listid.toString());

	if (fs.existsSync(path)) {
		const adapter = new FileAsync(path);
		const ip = res.locals.ip;

		low(adapter).then(db => {
			let list = db.getState();
			list = liststate(list, ip);
			res.json(list);
		});
	} else {
		res.status(500);
		return res.json({error: 'This list doesn\'t exist.'});
	}
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
