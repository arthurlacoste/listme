const fs = require('fs-extra');
const shortid = require('shortid');
const slugme = require('slugme');
const low = require('lowdb');
const ddg = require('ddg');
const FileAsync = require('lowdb/adapters/FileAsync');
const liststate = require('./liststate');

// Test if a file exist, return false if not
const fileExist = async path => {
  const thisFileExist = await fs.pathExists(path);
  if (thisFileExist) {
    return true;
  } else {
    return false;
  }
};

const striptag = /(<([^>]+)>)/ig;

// Construct path to db file
const dbpath = (type, id) => {
  return `${__dirname}/../db/${type}/${id}.db.json`;
};

const addNewList = async (req, res) => {
  if (typeof req.body.item === undefined) {
    return Promise.reject('No item given');
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
  await db.defaults(list).write();
  return list;
};

const addAttributes = async (req, res) => {
  if (!req.params.listid || !req.params.itemid) {
    return Promise.reject('No list id or item id given.');
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
    await db.setState(list).write();
    return list;

  } else {
    return Promise.reject('This list doesn\'t exist.');
  }
};

const addItem = async (req, res) => {
  if (!req.params.listid || !req.body.item) {
    return Promise.reject('No item given');
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
    await db.setState(list).write();
    return list;

  } else {
    return Promise.reject('This list doesn\'t exist.');
  }
};

const vote = async (req, res) => {
  if (!req.params.listid || !req.params.vote) {
    return Promise.reject('No item given');
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
    await db.setState(list).write();
    return list;

  } else {
    return Promise.reject('This list doesn\'t exist.');
  }
};

// Set custom slug if is not already exists
const setSlug = async (req, res, currentPath) => {
  const adapter = new FileAsync(currentPath);
  const ndb = await low(adapter);
  const list = ndb.getState();
  list.id = slugme(req.body.slug);

  const newPath = dbpath('items', list.id);
  const urlTaken = await fileExist(newPath);

  if (urlTaken) {
    return Promise.reject('This URL is already taken, try another.');
  }

  const newAdapter = new FileAsync(newPath);
  const ldb = await low(newAdapter);
  await ldb.setState(list).write();

  await fs.unlink(currentPath);
  return list;
};

const setSettings = async (req, res) => {
  if (!req.params.listid) {
    return Promise.reject('No item given');
  }

  const path = dbpath('items', req.params.listid.toString());
  const fileofThisList = await fileExist(path);

  if (fileofThisList) {
    const adapter = new FileAsync(path);
    console.log('PATH', path)
    const ip = res.locals.ip;

    const db = await low(adapter);
    let list = db.getState();

    // If it's owner, he can edit settings
    if (ip === list.ip) {
      if (req.body.name) {
        list.name = req.body.name;
      }
      list = liststate(list, ip);
      await db.setState(list).write();

      if (req.body.slug && req.body.slug !== list.id) {
        return setSlug(req, res, path);
      } else {
        return list;
      }
    } else {
      return Promise.reject('You are not the owner of the list.');
    }
  } else {
    return Promise.reject('This list doesn\'t exist.');
  }
};

const getList = async (req, res) => {
  if (!req.params.listid) {
    return Promise.reject('No item given');
  }
  const path = dbpath('items', req.params.listid.toString());
  const fileofThisList = await fileExist(path);

  if (fileofThisList) {
    const adapter = new FileAsync(path);
    const ip = res.locals.ip;

    const db = await low(adapter);
    let list = db.getState();
    list = liststate(list, ip);
    return(list);
  } else {
    return Promise.reject('This list doesn\'t exist.');
  }
};

// Get all results from duckduckgo
const ddgSearch = async (req, res, callback) => {
  const item = req.params.item.toString();

  const options = {
    useragent: 'listJS',
    no_redirects: '1', // eslint-disable-line camelcase
    format: 'json'
  };

  ddg.query(item, options, async (err, data) => {
    if (err) {
      return Promise.reject(err);
    }
    return (data);
  });
};

module.exports.addNewList = addNewList;
module.exports.addAttributes = addAttributes;
module.exports.addItem = addItem;
module.exports.vote = vote;
module.exports.setSettings = setSettings;
module.exports.getList = getList;
module.exports.ddgSearch = ddgSearch;
