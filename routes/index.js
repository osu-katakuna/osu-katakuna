function nocache(module) {require("fs").watchFile(require("path").resolve(module), () => {delete require.cache[require.resolve(module)]})}
nocache("../utils/database");
nocache("../utils/ipc");
nocache("../utils/channels/channel_list");
nocache("../utils/bancho_protocol");
nocache("./login");

// NO CACHE STUFF FOR DEVELOPMENT PURPOSES!

var router = require('express').Router()
const db = require("../utils/database")
var uuid = require("uuid").v4;
var cmd_queue = require("../utils/queue");
var ipc = require("../utils/ipc");
var channel_list = require("../utils/channels/channel_list");
var protocol = require('../utils/bancho_protocol')

var user_list = [];
var matches = [];

function findOnlineUser(user_id) {
	for(var i = 0; i < user_list.length; i++) {
		if(user_list[i].user_id == user_id) {
			return user_list[i];
		}
	}
	return undefined;
}

db.getAllOnlineUsers().forEach((u) => {
	user_list.push(db.find_user(u.id));
})

function onUserLogin(user) {
	cmd_queue.queueTo(db.getUserToken(user.user_id), channel_list.joinChannel(user, "announce"));
}

router.get('/', (req, res) => res.send("osu!katakuna is up!"))

router.post('/', (req, res) => {
	protocol = require('../utils/bancho_protocol')
	if(!req.get("osu-token") && req.get("osu-version")) {
		require("./login")(req, res, onUserLogin, user_list);
	}
	else {
		var user = db.getUserFromToken(req.get("osu-token"));
		if(user) {
			// token verification
			if(!findOnlineUser(user.id)) {
				user_list.push(db.find_user(user.id));
			}
			var packets = protocol.packet_parser(new Buffer.from(req.body));
			for(var i = 0; i < packets.length; i++) {
				var packet = packets[i];

				if(packet.type == protocol.constants.client_pong) {
					db.setUserToken(user.id, req.get("osu-token"), req.ip);
				} else if (packet.type == protocol.constants.client_logout) {
					console.log(`User ${user.username}(${user.id}) required log-out.`);
					db.removeUserTokens(user.id);
					cmd_queue.queueAllExceptOwner(req.get("osu-token"), protocol.generator.userLogout(user.id));
					user_list = user_list.filter(u => !(u.id == user.id));
				} else if (packet.type == protocol.constants.client_requestStatusUpdate) {
					console.log(`User ${user.username}(${user.id}) requires status update.`);
					res.write(protocol.generator.userPanel(user));
					res.write(protocol.generator.userStats(db.find_user(user.id).stats));
				} else if (packet.type == protocol.constants.client_sendPublicMessage) {
					var msg = protocol.parser.publicMessage(packet);
					console.log(`User ${user.username}(${user.id}) sent message on ${msg.channel}(${msg.message}).`);
					cmd_queue.queueAllExceptOwner(req.get("osu-token"), protocol.generator.chat_message(user, msg.channel, msg.message));
					// send message to chat
				} else if (packet.type == protocol.constants.client_sendPrivateMessage) {
					var msg = protocol.parser.publicMessage(packet);
					console.log(`User ${user.username}(${user.id}) sent PRIVATE message to ${msg.channel}(${msg.message}).`);
					db.addMessage(user, msg);
				} else if (packet.type == protocol.constants.client_changeAction) {
					var new_status = protocol.parser.actionChange(packet);
					console.log(`User ${user.username}(${user.id}) wants to change current status to ${new_status.actionID}(${new_status.actionText}).`);
					var x = findOnlineUser(user.id);
					x.setStatus(new_status.actionID, new_status.actionText, new_status.actionMD5, new_status.actionMods);
					cmd_queue.queueAll(protocol.generator.userStats(x.stats));
				} else if (packet.type == protocol.constants.client_channelJoin) {
					console.log(`User ${user.username}(${user.id}) joins channel ${protocol.read_string(packet, 0)}.`);
					res.write(channel_list.joinChannel(findOnlineUser(user.id), protocol.read_string(packet, 0).toString().slice(1)))
				} else if (packet.type == protocol.constants.client_channelPart) {
					console.log(`User ${user.username}(${user.id}) left channel ${protocol.read_string(packet, 0)}.`);
					channel_list.partChannel(findOnlineUser(user.id), protocol.read_string(packet, 0).toString().slice(1))
				} else if (packet.type == protocol.constants.client_startSpectating) {
					var host = findOnlineUser(packet.data.readUInt32LE());
					var me = findOnlineUser(user.id);

					console.log(`User ${me.username}(${me.user_id}) is going to spectate ${host.username}(${host.user_id})...`)

					if(me.spectating) {
						var host_2 = findOnlineUser(me.whoIsSpectating);
						host_2.removeSpectator(me);
					}

					me.spectate(host);
					host.addSpectator(me);
					me.spectator_data = [];
				} else if (packet.type == protocol.constants.client_stopSpectating) {
					var me = findOnlineUser(user.id);

					if(me.spectating) {
						var host = findOnlineUser(me.whoIsSpectating);
						host.removeSpectator(me);
						me.stopSpectating();
						console.log(`User ${me.username}(${me.id}) stopped spectating ${host.username}(${host.id})...`)
					}
				} else if (packet.type == protocol.constants.client_spectateFrames) {
					var host = findOnlineUser(user.id);
					console.log(`Received spectator frames for ${host.username}(${host.user_id})...`);
					host.spectators.forEach((spectator) => {
						if(spectator.user_id == host.user_id) return;
						//cmd_queue.queueTo(spectator.token.token_id, protocol.generator.spectateFrames(packet.data));
						spectator.spectator_data.push(protocol.generator.spectateFrames(packet.data));
						//console.log("PACKET FRAME:", protocol.parser.spectatorPacket(packet.data))
					});
				} else if (packet.type == protocol.constants.client_friendAdd) {
					var me = findOnlineUser(user.id);
					var user_id = packet.data.readUInt32LE(0);
					var u = db.find_user(user_id);
					if(u) {
						me.addFriend(user_id);
						console.log(`User ${me.username} added ${u.username} as friend!`);
					}
				} else if (packet.type == protocol.constants.client_friendRemove) {
					var me = findOnlineUser(user.id);
					var user_id = packet.data.readUInt32LE(0);
					var u = db.find_user(user_id);
					if(u) {
						me.removeFriend(user_id);
						console.log(`User ${me.username} removed ${u.username} from their friend list!`);
					}
				} else if (packet.type == protocol.constants.client_createMatch) {
					// join match?
					// send to everyone in lobby
					console.log("########################", protocol.parser.matchSettings(packet));
				}

				var dms = db.getPMsForUser(user.id);
				if(dms.length > 0) {
					for(var m = 0; m < dms.length; m++) {
						var msg = dms[m];
						console.log("message", msg);
						cmd_queue.queueTo(req.get("osu-token"), protocol.generator.chat_message(msg, user.username, msg.message));
					}
				}

				var u = findOnlineUser(user.id);
				if(u && u.spectating) {
					if(u.spectator_data && u.spectator_data.length > 0) {
						u.spectator_data.forEach((x) => res.write(x));
						u.spectator_data = u.spectator_data.slice(u.spectator_data.length);
					}
				}

				var d = cmd_queue.forToken(req.get("osu-token"));
				res.write(d);
		}
	} else {
		res.write(protocol.generator.login_fail())
	}
}

	res.end("", "binary")
})

module.exports = router
