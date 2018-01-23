const test = require('ava');
const md5 = require('md5');
const {to} = require('await-to-js');
const rewire = require('rewire');
const shortid = require('shortid');

const api = rewire('../src/apicore.js');

const ip = 'u';
const testID = 'test-' + shortid.generate();

const req = {
  body: {
    item: 'item',
    check: '1',
    slug: testID,
    name: 'Great List title'
  },
  params: {
    listid: 'sydh8xaxz',
    itemid: '0',
    vote: 1,
    item: 'orange'
  }
};

const res = {
  locals: {
    ip: "haship",
  }
};

test.serial('Set settings, I am the owner', async t => {
  let err, list;
  let resAlt = JSON.parse(JSON.stringify(res));
  resAlt.locals.ip = 'haship';
  const reqAlt = JSON.parse(JSON.stringify(req));
  reqAlt.body.slug = 'sydh8xaxz';

  [err, list] = await to(api.setSettings(reqAlt, resAlt));

  if (err) {
    console.log(err);
    return t.fail();
  }
  return t.pass();
});

test.serial('Set settings, but not the owner', async t => {
  let resAlt = JSON.parse(JSON.stringify(res));
  resAlt.locals.ip = 'none';
  let err, list;

  [err, list] = await to(api.setSettings(req, resAlt));

  if (err) {
    console.log(err);
    return t.pass();
  }
  return t.fail();
});

test.serial('Test if a file exist', async t => {
  let err, list;
  let fileExist = api.__get__('fileExist');
  [err, list] = await to(fileExist(`${__dirname}/../db/items/sydh8xaxz.db.json`));

  console.log(list);

  if (list === true) {
    return t.pass();
  }
  return t.fail();
});

test.serial('Test a file does not exist', async t => {
  let err, list;
  let fileExist = api.__get__('fileExist');
  [err, list] = await to(fileExist(`${__dirname}/../db/items/thisFileDoesntExist.db.json`));

  console.log(list);

  if (list === false) {
    return t.pass();
  }
  return t.fail();
});

test.serial('Add new item on new list.', async t => {
  let err, list;
  [err, list] = await to(api.addNewList(req, res));

  if (err) {
    return t.fail();
  }
  return t.pass();
});

test.serial('Add new item on new list, item missing', async t => {
  let err, list;
  [err, list] = await to(api.addNewList({}, res));

  if (err) {
    console.log(err);
    return t.pass();
  }
  return t.fail();
});

test.serial('Add attributes', async t => {
  let err, list;
  [err, list] = await to(api.addAttributes(req, res));

  if (err) {
    return t.fail();
  }
  return t.pass();
});

test.serial('Add attributes, no listid', async t => {
  let err, list;
  [err, list] = await to(api.addAttributes({}, res));

  if (err) {
    return t.pass();
  }
  return t.fail();
});

test.serial('Add item to an existing list', async t => {
  let err, list;
  let addItem = api.__get__('addItem');
  [err, list] = await to(addItem(req, res));

  if (err) {
    console.log(err);
    return t.fail();
  }
  return t.pass();
});

test.serial('Vote for an item', async t => {
  let err, list;
  [err, list] = await to(api.vote(req, res));

  if (err) {
    return t.fail();
  }
  return t.pass();
});

test.serial('Get List', async t => {
  let err, list;

  [err, list] = await to(api.getList(req, res));

  if (err) {
    console.log(err);
    return t.fail();
  }
  return t.pass();
});

test.serial('Set a slug', async t => {
  let err, list;
  let setSlug = api.__get__('setSlug');
  const reqAlt = JSON.parse(JSON.stringify(req));
  reqAlt.body.slug = testID;

  [err, list] = await to(setSlug(reqAlt, res, `${__dirname}/../db/items/sydh8xaxz.db.json`));

  if (err) {
    console.log(err);
    return t.fail();
  }

  reqAlt.body.slug = 'sydh8xaxz';
  [err, list] = await to(setSlug(reqAlt, res, `${__dirname}/../db/items/${testID}.db.json`));

  return t.pass();
});

test.serial('Set a slug, URL already taken', async t => {
  let err, list;
  let setSlug = api.__get__('setSlug');
  const reqAlt = JSON.parse(JSON.stringify(req));
  reqAlt.body.slug = 'sydh8xaxz';
  [err, list] = await to(setSlug(reqAlt, res, `${__dirname}/../db/items/${testID}.db.json`));

  if (err) {
    console.log(err)
    return t.pass();
  }

  return t.fail();
});


test('Duckduckgo search', async t => {
  let err, list;

  [err, list] = await to(api.ddgSearch(req, res));

  if (err) {
    console.log(err);
    return t.fail();
  }
  return t.pass();
});
