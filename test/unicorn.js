const test = require('ava');
const md5 = require('md5');
const api = require('../src/apicore.js');
const {to} = require('await-to-js');

const ip = 'u';

const req = {
  body: {
    item: 'item',
    check: '1',
    slug: 'human'
  },
  params: {
    listid: 'Sydh8XAXz',
    itemid: '0',
    vote: 1
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
  [err, list] = await to(api.addItem(req, res));

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
