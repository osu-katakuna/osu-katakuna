const db = require("./database");

var queue = [];

function queueAllExceptOwner(owner_token, data) {
	const u = db.getAllOnlineUsers();
	if(u.length < 1) return;
	u.forEach((x) => {
		if(x.token_id == owner_token) return;

		var __x = false, o = 0;
		for(var i = 0; i < queue.length; i++) {
			if(queue[i] != undefined && queue[i].token != undefined) {
				if(queue[i].token != undefined && queue[i].token == x.token_id) {
					o = i;
					__x = true;
					break;
				}
			}
		}

		if(!__x) {
			queue.push({
				"token": x.token_id,
				"data": [new Buffer.from(data)]
			});
		} else {
			queue[o].data.push(data);
		}
	});
}

function queueAll(data) {
	const u = db.getAllOnlineUsers();
	if(u.length < 1) return;

	u.forEach((x) => {
		var __x = false, o = 0;
		for(var i = 0; i < queue.length; i++) {
			if(queue[i] != undefined && queue[i].token != undefined) {
				if(queue[i].token != undefined && queue[i].token == x.token_id) {
					o = i;
					__x = true;
					break;
				}
			}
		}
		if(!__x) {
			queue.push({
				"token": x.token_id,
				"data": [new Buffer.from(data)]
			});
		} else {
			queue[o].data.push(data);
		}
	});
}

function queueTo(x, data) {
	const u = db.getAllOnlineUsers();
	if(u.length < 1) return;
	var __x = false, o = 0;
	for(var i = 0; i < queue.length; i++) {
		if(queue[i] != undefined && queue[i].token != undefined) {
			if(queue[i].token != undefined && queue[i].token == x) {
				o = i;
				__x = true;
				break;
			}
		}
	}
	if(!__x) {
		queue.push({
			"token": x,
			"data": [new Buffer.from(data)]
		});
	} else {
		queue[o].data.push(data);
	}
}

function forToken(token) {
	for(var i = 0; i < queue.length; i++) {
		if(queue[i] != undefined && queue[i].token != undefined && queue[i].token == token) {
			console.log("forToken", token, queue[i]);
			var data = queue[i].data[0];
			queue[i].data.shift();
			if(queue[i].data.length <= 0) {
				queue[i] = undefined;
			}
			return data;
		}
	}
	return "";
}

module.exports = {
	"forToken": forToken,
	"queueAllExceptOwner": queueAllExceptOwner,
	"queueAll": queueAll,
	"queueTo": queueTo
};
