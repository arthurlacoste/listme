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
    slug: testID
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

test('Add new item on new list.', async t => {
  let err, list;
  [err, list] = await to(api.addNewList(req, res));

  if (err) {
      return t.fail();
  }
  return t.pass();
});

test('Add attributes', async t => {
  let err, list;
  [err, list] = await to(api.addAttributes(req, res));

  if (err) {
      return t.fail();
  }
  return t.pass();
});

test('Add item to an existing list', async t => {
  let err, list;
  let addItem = api.__get__('addItem');
  [err, list] = await to(addItem(req, res));

  if (err) {
      return t.fail();
  }
  return t.pass();
});

test('Vote for an item', async t => {
  let err, list;
  [err, list] = await to(api.vote(req, res));

  if (err) {
      return t.fail();
  }
  return t.pass();
});



test('Set settings, but not the owner', async t => {
  const resAlt = res;
  res.locals.ip = 'none';

  let err, list;

	[err, list] = await to(api.setSettings(req, resAlt));

	if (err) {
      return t.pass();
	}
	return t.fail();
});

test('Get List', async t => {
  let err, list;

	[err, list] = await to(api.getList(req, res));

	if (err) {
      return t.fail();
	}
	return t.pass();
});

test('Set a slug', async t => {
  let err, list;
  let setSlug = api.__get__('setSlug');
  [err, list] = await to(setSlug(req, res, `${__dirname}/../db/items/Sydh8XAXz.db.json`));

  if (err) {
    console.log(err)
      return t.fail();
  }
  const reqAlt = req;
  reqAlt.body.slug = 'Sydh8XAXz';
  [err, list] = await to(setSlug(reqAlt, res, `${__dirname}/../db/items/${testID}.db.json`));

  return t.pass();


});

test('Duckduckgo search', async t => {
  let err, list;

	[err, list] = await to(api.ddgSearch(req, res));

	if (err) {
      return t.fail();
	}
	return t.pass();
});
