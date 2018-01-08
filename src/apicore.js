const fs = require('fs-extra');
const shortid = require('shortid');
const slugme = require('slugme');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const liststate = require('./liststate');
const {promisify} = require('util');
const tryPath = promisify(fs.pathExists);


// Test if a file exist, return false if not
const fileExist = async (path) => {
  try {
    const thisFileExist = await fs.pathExists(path);
    if (thisFileExist) {
      return true;
    }
  } catch (error) {
    return false;
  }
}

const striptag = /(<([^>]+)>)/ig;

// Construct path to db file
const dbpath = (type, id) => {
  return `${__dirname}/../db/${type}/${id}.db.json`;
};

const addNewList = async (req, res, callback) => {
  if (!req.body.item) {
    return callback('No item given');
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

  const db = await low(adapter);
  db.defaults(list).write();
  callback(null, list);
}

const addAttributes = async (req, res, callback) => {
  if (!req.params.listid || !req.params.itemid) {
    return callback('No list id or item id given.');
  }
  const path = dbpath('items', req.params.listid.toString());
  const thisFileExist = await fileExist(path);

  if (thisFileExist) {
    const itemid = req.params.itemid;
    const adapter = new FileAsync(path);
    const ip = res.locals.ip;

    const db = await low(adapter);
    let list = db.getState();
    if (req.body.check) {
      list.items[itemid].check = (req.body.check === '1');
    }
    list = liststate(list, ip);
    db.setState(list).write().then(() => callback(null,  list));

  } else {
    return callback('This list doesn\'t exist.');
  }
}

const addItem = async (req, res, callback) => {
  if (!req.params.listid || !req.body.item) {
    return callback('No item given');
  }
  const path = dbpath('items', req.params.listid);
  const thisFileExist = await fileExist(path);

  if (thisFileExist) {
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

    const db = await low(adapter);
    let list = db.getState();
    list.items.push(item);
    list = liststate(list, ip);
    db.setState(list).write().then(() => callback(null, list));
  } else {
    return callback('This list doesn\'t exist.');
  }
}

const vote = async (req, res, callback) => {
  if (!req.params.listid || !req.params.vote) {
    return callback('No item given');
  }
  const path = dbpath('items', req.params.listid.toString());
  const thisFileExist = await fileExist(path);

  if (thisFileExist) {
    const itemid = req.params.itemid;
    const adapter = new FileAsync(path);
    const ip = res.locals.ip;
    const vote = (req.params.vote === '1') ? 1 : -1;

    const db = await low(adapter);
    let list = db.getState();
    list.items[itemid].votes[ip] = vote;
    list = liststate(list, ip);
    db.setState(list).write().then(() => callback(null, list));
  } else {
    return callback('This list doesn\'t exist.');
  }
}

// Set custom slug if is not already exists
const setSlug  = async (req, res, path, callback) => {
  const adapter = new FileAsync(path);
  const ndb = await low(adapter);
  let list = ndb.getState();
  list.id = slugme(req.body.slug);

  const newPath = dbpath('items', list.id);
  const urlTaken = await fileExist(newPath);

  if (urlTaken) {
    return callback('This URL are already taken, try another.');
  }

  const newAdapter = new FileAsync(newPath);
  const ldb = await low(newAdapter);
  await ldb.setState(list).write();

  await fs.unlink(path);
  return callback(null, list);
}

const setSettings = async (req, res, callback) => {
  if (!req.params.listid) {
    return callback('No item given');
  }

  const path = dbpath('items', req.params.listid.toString());
  const fileofThisList = await fileExist(path);

  if (fileofThisList) {
    const adapter = new FileAsync(path);
    const ip = res.locals.ip;

    const db =  await low(adapter);
    let list = db.getState();

    // If it's owner, he can edit settings
    if (ip === list.ip) {
      if (req.body.name) {
        list.name = req.body.name;
      }
      list = liststate(list, ip);
      await db.setState(list).write();

      if (req.body.slug && req.body.slug !== list.id) {
        setSlug(req, res, path, callback);
      } else {
        return callback(null, list);
      }

    } else {
      return callback('You are not the owner of the list.');
    }

  } else {
    return callback('This list doesn\'t exist.');
  }
}

const getList = async (req, res, callback) => {
  if (!req.params.listid) {
    return callback('No item given');
  }
  const path = dbpath('items', req.params.listid.toString());
  const fileofThisList = await fileExist(path);

  if (fileofThisList) {
    const adapter = new FileAsync(path);
    const ip = res.locals.ip;

    const db = await low(adapter)
    let list = db.getState();
    list = liststate(list, ip);
    callback(null, list);
  } else {
    return callback('This list doesn\'t exist.');
  }
}


// Get all results from duckduckgo
const ddgSearch = (req, res, callback) => {
  const item = req.params.item.toString();

  const options = {
    useragent: 'listJS',
    no_redirects: '1', // eslint-disable-line camelcase
    format: 'json'
  };

  ddg.query(item, options, (err, data) => {
    if (err) {
      return callback(err);
    }
    return callback(null, data);
  });
}


module.exports.addNewList = addNewList;
module.exports.addAttributes = addAttributes;
module.exports.addItem = addItem;
module.exports.vote = vote;
module.exports.setSettings = setSettings;
module.exports.getList = getList;
module.exports.ddgSearch = ddgSearch;
