const Token = require('../models/Token');
const Database = require('../utils/Database/');
const Packets = require('../utils/BanchoUtils/Packets');
const Config = require('../global/config.json');
var WebSocket = require("../global/global").websocket;

var tokens = [];

function FindUsernameToken(username) {
  for(var i = 0; i < tokens.length; i++) {
    if(tokens[i].user.username === username) return tokens[i];
  }
}

function FindUserID(uid) {
  for(var i = 0; i < tokens.length; i++) {
    if(tokens[i].user.user_id === uid) return tokens[i];
  }
}

function FindBotUserID(uid) {
  for(var i = 0; i < tokens.length; i++) {
    if(tokens[i].user.user_id === uid && tokens[i].bot) return tokens[i];
  }
}

function FindUserToken(token) {
  for(var i = 0; i < tokens.length; i++) {
    if(tokens[i].token === token) return tokens[i];
  }
}

function EnqueueToMultiple(ids, data) {
  ids.forEach((id) => FindUserID(id).enqueue(data));
}

function AddUserToken(user, token) {
  tokens.push(new Token(user, token, this));
  UpdateUserStatus(user);
  console.log(`[i] Token '${token}' registered!`);
}

function AddBotUserToken(user, token) {
  var t = new Token(user, token, this);
  t.bot = true;
  tokens.push(t);
  console.log(`[i] Bot Token '${token}' registered!`);
}

function UpdateUserStatus(user) {
  if(Config.websocket) {
    if(WebSocket == undefined) {
      WebSocket = require("../global/global").websocket;
    }
    WebSocket.UpdateUserStatus(user);
  }
}

function SendSpectatorFrameWS(user, frames) {
  if(Config.websocket) {
    if(WebSocket == undefined) {
      WebSocket = require("../global/global").websocket;
    }
    WebSocket.UpdateSpectateUser(user, frames);
  }
}

function RemoveToken(token) {
  if(Config.websocket) {
    if(WebSocket == undefined) {
      WebSocket = require("../global/global").websocket;
    }
    if(FindUserToken(token))
      WebSocket.UpdateUserOffline(FindUserToken(token).user);
  }
  tokens = tokens.filter((t) => t.token != token);
  console.log(`[i] Token '${token}' removed!`);
}

function EnqueueAll(packet) {
  tokens.forEach((t) => t.enqueue(packet));
}

function EnqueueAllExcept(uid, packet) {
  tokens.filter((t) => t.user.user_id != uid).forEach((t) => t.enqueue(packet));
}

function OnlineUsers() {
  return tokens.map((u) => u.user);
}

function OnlineUsersTokens() {
  return tokens;
}

function GetJoinedChannel(channel, user) {
  if(channel[0] !== '#') {
    channel = '#' + channel;
  }
  const u = FindUserID(user.user_id);
  if(u) {
      const ch = u.joinedChannels.filter(x => x.name == channel);
      return ch.length > 0 ? ch[0] : undefined;
  }
}

function ForceUpdateStats(user_id) {
  Database.GetUserStats(user_id).forEach(stat => {
    var user = FindUserID(user_id) ? FindUserID(stat.user_id).user : undefined;
    if(user == undefined) return;

    user.cachedStats[stat.gameMode].plays = stat.play_count;
    user.cachedStats[stat.gameMode].totalScore = stat.score;
    user.cachedStats[stat.gameMode].rank = stat.rank;
    user.cachedStats[stat.gameMode].accuracy = stat.accuracy;
    user.cachedStats[stat.gameMode].pp = stat.pp;
  });
}

function UpdateStats() {
  tokens.filter(t => !t.bot).forEach(t => {
    if((new Date().getTime() - t.lastEvent) >= 120000) { // wait for two minutes
      console.log(`[x] User ${t.user.username} timed out. Deleting token.`);
      t.LeaveAllChannels();
      Database.RemoveUserTokens(t.user.user_id);
      RemoveToken(t.token);
      EnqueueAll(Packets.UserLogout(t.user));
      return;
    }

    ForceUpdateStats(t.user.user_id);
    if(Database.GetUserBanState(t.user.user_id)) {
      FindUserID(t.user.user_id).Ban();
    }
  });


  setTimeout(UpdateStats, 1000);
}

setTimeout(UpdateStats, 1000);

module.exports = {
  FindUsernameToken,
  AddUserToken,
  RemoveToken,
  EnqueueAll,
  FindUserToken,
  OnlineUsers,
  FindUserID,
  EnqueueToMultiple,
  OnlineUsersTokens,
  EnqueueAllExcept,
  GetJoinedChannel,
  FindBotUserID,
  AddBotUserToken,
  ForceUpdateStats,
  UpdateUserStatus,
  SendSpectatorFrameWS
};
