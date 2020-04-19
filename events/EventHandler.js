var router = require('express').Router();
const Parsers = require('../utils/BanchoUtils/Parsers');
const Event = require('../models/Event').Event;
const Database = require('../utils/Database/');
const Events = require('./events');
const ParsePacket = require('../utils/BanchoUtils/Parsers/PacketParser');
const Packets = require("../utils/BanchoUtils/Packets");
const Tokens = require("../global/global").tokens;
const Token = require("../models/Token");
var uuid = require("uuid").v4;

var events = [];

router.get('/', (req, res) => res.send("osu!katakuna is up!"));

function GetEvent(event) {
	if(event === undefined) return undefined;
	return events.filter((e) => e.name == event)[0];
}

function ExecuteEvent(event, args) {
	if(event == undefined) throw new Error("Event not set");
	if(args == undefined) throw new Error("Events should have arguments!");
	if(GetEvent(event) === undefined) throw new Error(`Tried to execute an unknown event ${event}`);

	console.log(`Executing event ${event} with args ${args}`);
	GetEvent(event).run(args);
}

function RegisterEvent(event) {
	if(!event instanceof Event) throw new Error("event must be of Event type!");
	if(GetEvent(event.name)) throw new Error(`Cannot register event ${event.name}; it's already registered!`);
	events.push(new event);
	console.log(`Registered event ${event.name} sucessfully!`);
}

function GetEventNameByPacketType(type) {
	if(type === undefined) return undefined;

	const ev = events.filter((e) => e.type == type)[0];
	if(ev) return ev.name;
}

function MessageQueue(token) {
	const user = token.user;
	const messages = Database.GetUserMessages(user.user_id);
	if(messages.length > 0) {
		messages.forEach((m) => {
			const _token = Tokens.FindUserID(m.from_user_id);
			var from = undefined;

			if(_token) from = _token.user;
			else from = Database.GetUser(m.from_user_id);

			console.log(from)
			token.SendMessage(from, user.username, m.message);
			Database.SetMessageSeen(m.id);
		});
	}
}

router.post('/', (req, res) => {
	const event_data = {
		req,
		res
	}

	const token = req.get("osu-token") != undefined ? req.get("osu-token") : uuid();
	const ip = req.ip;
	res.setHeader("cho-protocol", "19");
	res.setHeader("cho-token", token);
	res.writeHead(200);

	if(!req.get("osu-token") && req.get("osu-version")) {
		const loginData = Parsers.LoginParser(event_data);
		ExecuteEvent("LoginEvent", { res, loginData, token, ip });
	} else {
		var _token = Tokens.FindUserToken(token);
		if(_token === undefined || !_token instanceof Token) {
			console.log(`[X] Unknown token ${token}. Forcing a login failure!`);
			res.write(Packets.ServerRestart(0));
		} else {
			var user = _token.user;
			var packets = ParsePacket(new Buffer.from(req.body));
			for(var i = 0; i < packets.length; i++) {
				var data = packets[i].data;
				console.log(packets[i]);
				if(!GetEventNameByPacketType(packets[i].type)) {
					console.log("Received unknown packet:", packets[i]);
					break;
				}
				ExecuteEvent(GetEventNameByPacketType(packets[i].type), { res, data, user, ip, token: _token });
			}
			MessageQueue(_token);
			_token.queue.forEach((p) => res.write(p));
	    _token.resetQueue();
		}
	}

	res.end("", "binary");
})

Object.keys(Events).forEach((ev) => RegisterEvent(Events[ev])); // register all events

exports.Router = router
exports.RegisterEvent = RegisterEvent
