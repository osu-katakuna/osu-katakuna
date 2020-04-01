const protocol_constants = require("./bancho_constants")
const Int64LE = require("int64-buffer").Int64LE;

function buildPacket(__packet, __packetData) {
	if(__packetData == null) {
		var packet = new Buffer.alloc(7);

		packet.writeInt16LE(__packet, 0);
		packet.writeInt8(0x00, 2);
		packet.writeInt32LE(0, 3)

		return packet;
	}

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

function forceExit() {
	var buf = new Buffer.alloc(4);
	buf.writeInt32LE(128);

	return new Buffer.concat([buildPacket(protocol_constants.server_ping, null), buildPacket(protocol_constants.server_supporterGMT, buf)])
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
	console.log(packet.data.toString("hex"));
  var actionText = read_string(packet, 1);
  var actionMD5 = read_string(packet, 2 + actionText.length);
  var actionMods = packet.data.readInt8(packet.data.length - 9);

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

function botnet() {
	return buildPacket(protocol_constants.server_topBotnet, null);
}

function spectatorPacket(packet) {
  var frames = [];

  var extra = packet.readUInt32LE(0);
  var frame_cnt = packet.readUInt16LE(4);

  var frms = packet.slice(6);

  var off = 6;

  for(var f = 0; f < frame_cnt; f++) {
    off = off + 14;
    var frame = frms.slice(f * 14, 14 * (f + 1));
    frames.push({
      buttonState1: frame.readInt8(0),
      buttonState2: frame.readInt8(1),
      mouseX: frame.readFloatLE(2),
      mouseY: frame.readFloatLE(6),
      time: frame.readUInt32LE(10)
    })
  }

  var action = packet.readInt8(off);
  var score = packet.slice(off + 1)

  var score_obj = {
    time: score.readUInt32LE(0),
    id: score.readInt8(4),
    count300: score.readUInt16LE(5),
    count100: score.readUInt16LE(7),
    count50: score.readUInt16LE(9),
    countGeki: score.readUInt16LE(11),
    countKatu: score.readUInt16LE(13),
    countMiss: score.readUInt16LE(15),
    totalScore: score.readUInt32LE(17),
    maxCombo: score.readUInt16LE(21),
    currentCombo: score.readUInt16LE(23),
    perfect: score.readInt8(25),
    currentHP: score.readUInt16LE(26),
    tagByte: score.readInt8(29),
    usingScoreV2: !score.readInt8(28),
    comboPortion: 0.0,
    bonusPortion: 0.0,
    pass: true
  };

  if(score_obj.usingScoreV2 && score.length > 31) {
    score_obj.comboPortion = score.readDoubleLE(30);
    score_obj.bonusPortion = score.readDoubleLE(38);
  }

  if(score_obj.currentHP == 254) {
    score_obj.currentHP = 0;
    score_obj.pass = false;
  }

  return {
    score: score_obj,
    frames: frames,
    extra: extra,
    action: action
  }
}

function matchSettings(packet) {
		var match = {
			matchID: 0,
			inProgress: 0,
			unknown: 0,
			mods: 0,
			matchName: "",
			matchPassword: "",
			beatmapName: "",
			beatmapID: 0,
			beatmapMD5: "",
			slots: [],
			hostUserID: 0,
			gameMode: 0,
			scoringType: 0,
			teamType: 0,
			freeMods: 0
		};

		match.matchID = packet.data.readUInt16LE(0);
		match.inProgress = packet.data.readUInt16LE(2);
		match.mods = packet.data.readUInt32LE(4);
		match.matchName = read_string(packet, 8).toString();
		match.matchPassword = read_string(packet, 10 + match.matchName.length).toString();
		match.beatmapName = read_string(packet, 12 + match.matchName.length + match.matchPassword.length).toString();
		match.beatmapID = packet.data.readUInt32LE(14 + match.matchName.length + match.matchPassword.length + match.beatmapName.length);
		match.beatmapMD5 = read_string(packet, 16 + match.matchName.length + match.matchPassword.length + match.beatmapName.length).toString();

		var offset = 0;
		for(var i = 0; i < 16; i++) {
			var status = packet.data.readInt8(52 + i + offset + match.matchName.length + match.matchPassword.length + match.beatmapName.length);
			var team = packet.data.readInt8(68 + i + offset + match.matchName.length + match.matchPassword.length + match.beatmapName.length);
			if (status != protocol_constants.slot_status.free && status != protocol_constants.slot_status.locked) {
				console.log("[*] Possible user id? =>", packet.data.readInt32LE(53 + offset + i + match.matchName.length + match.matchPassword.length + match.beatmapName.length))
				offset += 4;
			}

			match.slots.push({
				"status": status,
				"team": team
			});
		}

		match.hostUserID = packet.data.readUInt32LE(68 + 16 + offset + match.matchName.length + match.matchPassword.length + match.beatmapName.length);
		match.gameMode = packet.data.readInt8(68 + 16 + 4 + offset + match.matchName.length + match.matchPassword.length + match.beatmapName.length);
		match.scoringType = packet.data.readInt8(68 + 16 + 4 + 1 + offset + match.matchName.length + match.matchPassword.length + match.beatmapName.length);
		match.teamType = packet.data.readInt8(68 + 16 + 4 + 2 + offset + match.matchName.length + match.matchPassword.length + match.beatmapName.length);
		match.freeMods = packet.data.readInt8(68 + 16 + 4 + 3 + offset + match.matchName.length + match.matchPassword.length + match.beatmapName.length);

		return match;
}

function multiLobbyStats(stats) {
	return buildPacket(protocol_constants.server_newMatch, match.getMatchData())
}

function spectatorBuilder(score) {
  var len = ((8 + (score.frames.length * 14)) + (score.score.usingScoreV2 ? 46 : 30));
  var buf = new Buffer.alloc(len);

  buf.writeUInt32LE(score.extra, 0);
  buf.writeUInt16LE(score.frames.length, 4);

  var frame_bfr = null;

  for(var f = 0; f < score.frames.length; f++) {
    var frame = score.frames[f];
    var fr_buf = new Buffer.alloc(14);

    fr_buf.writeInt8(frame.buttonState1, 0);
    fr_buf.writeInt8(frame.buttonState2, 1);
    fr_buf.writeFloatLE(frame.mouseX, 2);
    fr_buf.writeFloatLE(frame.mouseY, 6);
    fr_buf.writeUInt32LE(frame.time, 10);

    if(frame_bfr == null) {
      frame_bfr = fr_buf;
    } else {
      frame_bfr = Buffer.concat([frame_bfr, fr_buf]);
    }
  }

  if(frame_bfr != null) {
    frame_bfr.copy(buf, 6);
  }

  buf.writeInt8(score.action, 6 + (score.frames.length * 14));

  var score_buf = new Buffer.alloc(score.score.usingScoreV2 ? 46 : 30);

  score_buf.writeUInt32LE(score.score.time, 0);
  score_buf.writeInt8(score.score.id, 4)
  score_buf.writeUInt16LE(score.score.count300, 5)
  score_buf.writeUInt16LE(score.score.count100, 7)
  score_buf.writeUInt16LE(score.score.count50, 9)
  score_buf.writeUInt16LE(score.score.countGeki, 11)
  score_buf.writeUInt16LE(score.score.countKatu, 13)
  score_buf.writeUInt16LE(score.score.countMiss, 15)
  score_buf.writeUInt32LE(score.score.totalScore, 17)
  score_buf.writeUInt16LE(score.score.maxCombo, 21)
  score_buf.writeUInt16LE(score.score.currentCombo, 23)
  score_buf.writeInt8(score.score.perfect, 25)
  score_buf.writeUInt16LE(score.score.pass ? score.score.currentHP : 254, 26)
  score_buf.writeInt8(score.score.tagByte, 28)
  score_buf.writeInt8(score.score.usingScoreV2, 29)

  if(score.score.usingScoreV2) {
    score_buf.writeDoubleLE(score.score.comboPortion, 30);
    score_buf.writeDoubleLE(score.score.bonusPortion, 38);
  }

  score_buf.copy(buf, 7 + (score.frames.length * 14))

  return buf;
}

function menuIcon(url, url_direction) {
	var data = url;
	if(url_direction && url_direction.length > 0) {
		data += "|" + url_direction
	}
	return buildPacket(protocol_constants.server_mainMenuIcon, packString(data));
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
		"spectateFrames": spectateFrames,
		"botnet": botnet,
		"forceExit": forceExit,
		"menuIcon": menuIcon
	},
	"parser": {
		"publicMessage": publicMessage,
		"actionChange": actionChange,
		"matchSettings": matchSettings
	}
};
