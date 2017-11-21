const listState = function (list, haship) {
  // Current IP
	Object.assign(list, {currentip: haship});

	Object.keys(list.items).forEach(key => {
		list.items[key].key = key;
		list.items[key].up = false;
		list.items[key].down = false;

    // Value = sum of each votes
		list.items[key].value = 0;
		Object.keys(list.items[key].votes).forEach(vote => {
			list.items[key].value += list.items[key].votes[vote];
		});

    // Compare ip to current, to fire buttons
		if (list.items[key].votes[haship]) {
			if (list.items[key].votes[haship] === 1) {
				list.items[key].up = true;
			} else if (list.items[key].votes[haship] === -1) {
				list.items[key].down = true;
			}
		}
	});

  // Sort items by value
	list.items.sort((a, b) => {
		return a.value - b.value;
	});

	return list;
};

module.exports = listState;
