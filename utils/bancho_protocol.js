const protocol_constants = require("./bancho_constants")
const Int64LE = require("int64-buffer").Int64LE;

function buildPacket(__packet, __packetData) {
	var packet = new Buffer.alloc(7 + __packetData.length);

	packet.writeInt16LE(__packet, 0);
	packet.writeInt8(0x00, 2);
	packet.writeInt32LE(__packetData.length, 3)
	__packetData.copy(packet, 7)

	return packet;
}

function uleb128Encode(num) {
	if(num == 0) return new Buffer.from(0x00);

	var arr = new Buffer.alloc(16);
	var length = 0;
	var offset = 0;

	while(num > 0) {
		arr[offset] = num & 127;
		offset += 1;
		num = num >> 7;
		if(num != 0) {
			arr[length] = arr[length] | 128
    }
		length += 1
	}

  return arr.slice(0, length);
}

function read_string(packet, offset) {
    var p = packet.data.slice(offset);
    console.log("read", p);

    if(p[0] == 0x0B) {
        if(p[1] == 0x00) {
          return new Buffer.from([0x00]);
        } else {
          return p.slice(2, 2 + p[1]);
        }
    } else {
			return read_string(packet, offset + 1)
		}
}

function packString(str) {
	if(str.length == 0) {
		return new Buffer.from([0x00]);
	} else {
		return new Buffer.concat([new Buffer.from([0x0B]),
		uleb128Encode(str.length),
		new Buffer.from(str)]);
	}
}

function notification_packet(message) {
	return buildPacket(protocol_constants.server_notification, packString(message))
}

function login_failure() {
	var buf = new Buffer.alloc(4);
	buf.writeInt32LE(-1);

	return buildPacket(protocol_constants.server_userID, buf)
}

function silenceEndTime(seconds) {
	var buf = new Buffer.alloc(4);
	buf.writeInt32LE(seconds);

	return buildPacket(protocol_constants.server_silenceEnd, buf)
}

function userID(uid) {
	var buf = new Buffer.alloc(4);
	buf.writeInt32LE(uid);

	return buildPacket(protocol_constants.server_userID, buf)
}

function protocolVersion(version) {
	var buf = new Buffer.alloc(4);
	buf.writeInt32LE(version);

	return buildPacket(protocol_constants.server_protocolVersion, buf)
}

function userSupporterGMT(supporter, GMT) {
	var result = 1

	if(supporter == true)
		result += 4
	if(GMT == true)
		result += 2

	var buf = new Buffer.alloc(4);
	buf.writeInt32LE(result);

	return buildPacket(protocol_constants.server_supporterGMT, buf)
}

function userLogout(uid) {
	var b = new Buffer.alloc(5);
	b.writeInt32LE(uid);

	return buildPacket(protocol_constants.server_userLogout, b)
}

function userPanel(user) {
	var username = packString(user.username)

	var buf = new Buffer.alloc(20 + username.length);
	buf.writeInt32LE(user.user_id);
	username.copy(buf, 4);
	buf.writeInt8(user.timezone, 4 + username.length);
	buf.writeInt16LE(user.country, 5 + username.length);
	buf.writeInt8(user.userRank, 7 + username.length);
	buf.writeFloatLE(user.longitude, 8 + username.length);
	buf.writeFloatLE(user.latitude, 12 + username.length);
	buf.writeInt32LE(user.rank, 16 + username.length);

	return buildPacket(protocol_constants.server_userPanel, buf)
}

function userStats(stats) {
	var __rankedScore = new Int64LE(stats.rankedScore).toBuffer();
	var __totalScore = new Int64LE(stats.totalScore).toBuffer();
	var action = packString(stats.status.actionText);
	var md5 = packString(stats.status.actionMD5);

	var buf = new Buffer.alloc(44 + action.length + md5.length)
	buf.writeUInt32LE(stats.user_id);
	buf.writeUInt8(stats.status.actionID, 4);
	action.copy(buf, 5);
	md5.copy(buf, 5 + action.length);
	buf.writeUInt32LE(stats.status.actionMods, 5 + action.length + md5.length);
	buf.writeUInt8(stats.gameMode, 9 + action.length + md5.length)
	buf.writeUInt32LE(0, 10 + action.length + md5.length)
	__rankedScore.copy(buf, 14 + action.length + md5.length);
	buf.writeFloatLE(stats.accuracy, 22 + action.length + md5.length)
	buf.writeUInt32LE(stats.playCount, 26 + action.length + md5.length)
	__totalScore.copy(buf, 30 + action.length + md5.length);
	buf.writeUInt32LE(stats.gameRank, 38 + action.length + md5.length)
	buf.writeUInt16LE(stats.pp, 42 + action.length + md5.length)

	return buildPacket(protocol_constants.server_userStats, buf)
}

function channelInfoEnd() {
	return buildPacket(protocol_constants.server_channelInfoEnd, new Buffer.from([0, 0, 0, 0]))
}

function joinChatChannel(channel) {
  return buildPacket(protocol_constants.server_channelJoinSuccess, packString(channel))
}

function kickedChatChannel(channel) {
	return buildPacket(protocol_constants.server_channelKicked, packString(channel))
}

function sendChannelInfo(channel_info) {
	var packet = new Buffer.concat([packString(channel_info.channel), packString(channel_info.description), new Buffer.from([0x00, 0x00, 0x00, 0x00])]);
	packet.writeUInt16LE(channel_info.members, packet.length - 4)

	return buildPacket(protocol_constants.server_channelInfo, packet)
}

function friendList(friends) {
	var packet = new Buffer.alloc(2 + (4 * friends.length));
	packet.writeUInt16LE(friends.length);
	for(var i = 0; i < friends.length; i++) {
		packet.writeUInt32LE(friends[i], 2 + (4 * i));
	}

	return buildPacket(protocol_constants.server_friendsList, packet)
}

function jumpscare(message) {
	return buildPacket(protocol_constants.server_jumpscare, new Buffer.from(packString(message)));
}

function getAttention() {
	return buildPacket(protocol_constants.server_getAttention, new Buffer.from([0x00, 0x00, 0x00, 0x00]));
}

function packet_parser(packet) {
  var offset = 0;
  var packets = [];

  while(offset < packet.length) {
    var packet_type = packet.readUInt16LE(offset),
        packet_length = packet.readUInt32LE(offset + 3);

    var packet_data = new Buffer.from(packet.slice(offset + 7, offset + packet_length + 7));

    packets.push({
      "type": packet_type,
      "data": packet_data
    });
    offset = offset + packet_length + 7;
  }

  return packets;
}

function actionChange(packet) {
	console.log(packet);
  var actionText = read_string(packet, 1);
  var actionMD5 = read_string(packet, 2 + actionText.length);
  var actionMods = packet.data.readUInt32LE(packet.data.length - 5);

	return {
		"actionID": packet.data[0],
		"actionText": actionText,
		"actionMD5": actionMD5,
		"actionMods": actionMods,
    "gameMode": packet.data[packet.data.length - 1]
	};
}

function publicMessage(packet) {
	var message = read_string(packet, 2);
    var channel = read_string(packet, 4 + message.length);
	return {
		"message": message,
		"channel": channel
	};
}

function chat_message(from, to, message) {
	var b = new Buffer.concat([packString(from.username), packString(message), packString(to), new Buffer.from([0x00, 0x00, 0x00, 0x00])]);
	b.writeInt32LE(from.id, b.length - 4);

	return buildPacket(protocol_constants.server_sendMessage, b)
}

function pms(messages) {
	var x = undefined;
	for(var i = 0; i < messages.length; i++) {
		if(x === undefined) {
			x = chat_message(messages[i], messages[i].username, messages[i].message);
		} else {
			x = new Buffer.concat([x, chat_message(messages[i], messages[i].username, messages[i].message)])
		}
	}
	return x;
}

function removeSpectator(user_id) {
	var b = new Buffer.alloc(4);
	b.writeUInt32LE(user_id);
	return buildPacket(protocol_constants.server_spectatorLeft, b)
}

function addSpectator(user_id) {
	var b = new Buffer.alloc(4);
	b.writeUInt32LE(user_id);
	return buildPacket(protocol_constants.server_spectatorJoined, b)
}

function noSongSpectate(user_id) {
	var b = new Buffer.alloc(4);
	b.writeUInt32LE(user_id);
	return buildPacket(protocol_constants.server_spectatorCantSpectate, b)
}

function spectateFrames(data) {
	return buildPacket(protocol_constants.server_spectateFrames, data);
}

module.exports = {
	"buildPacket": buildPacket,
	"packet_parser": packet_parser,
	"constants": protocol_constants,
	"read_string": read_string,
	"generator": {
		"notification": notification_packet,
		"login_fail": login_failure,
		"silenceEndTime": silenceEndTime,
		"userID": userID,
		"userSupporterGMT": userSupporterGMT,
		"protocolVersion": protocolVersion,
		"userPanel": userPanel,
		"userStats": userStats,
		"channelInfoEnd": channelInfoEnd,
		"joinChatChannel": joinChatChannel,
		"kickedChatChannel": kickedChatChannel,
		"sendChannelInfo": sendChannelInfo,
		"friendList": friendList,
		"userLogout": userLogout,
		"chat_message": chat_message,
		"pms": pms,
		"jumpscare": jumpscare,
		"getAttention": getAttention,
		"removeSpectator": removeSpectator,
		"addSpectator": addSpectator,
		"noSongSpectate": noSongSpectate,
		"spectateFrames": spectateFrames
	},
	"parser": {
		"publicMessage": publicMessage,
		"actionChange": actionChange
	}
};
