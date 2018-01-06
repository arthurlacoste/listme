const test = require('ava');
const md5 = require('md5');
const api = require('../src/apicore.js');

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
    ip: md5(ip + 'JE5G%$>b|2kV:1!(U&O')
  }
};

test.cb('Add new item on new list.', t => {
	api.addNewList(req, res, (err, list) => {
		if (err) {
      t.fail();
			return t.end();
		}
		t.pass();
    return t.end();
	});
});

test.cb('Add attributes', t => {
	api.addAttributes(req, res, (err, list) => {
		if (err) {
      t.fail();
			return t.end();
		}
		t.pass();
    return t.end();
	});
});

test.cb('Add item to an existing list', t => {
	api.addItem(req, res, (err, list) => {
		if (err) {
      t.fail();
			return t.end();
		}
		t.pass();
    return t.end();
	});
});

test.cb('Vote for an item', t => {
	api.addItem(req, res, (err, list) => {
		if (err) {
      t.fail();
			return t.end();
		}
		t.pass();
    return t.end();
	});
});

test.cb('Set settings', t => {
	api.setSettings(req, res, (err, list) => {
		if (err) {
      t.is('You are not the owner of the list.', err);
			return t.end();
		}
		t.fail();
    return t.end();
	});
});

test.cb('Get List', t => {
	api.getList(req, res, (err, list) => {
		if (err) {
      t.fail();
			return t.end();
		}
		t.pass();
    return t.end();
	});
});


api.setSettings(req, res, (err, list) => {
  if (err) {
    console.log(err);
  }
  console.log(list);
});
