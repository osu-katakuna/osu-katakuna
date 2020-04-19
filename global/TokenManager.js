const Token = require('../models/Token');

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
  console.log(`[i] Token '${token}' registered!`);
}

function AddBotUserToken(user, token) {
  var t = new Token(user, token, this);
  t.bot = true;
  tokens.push(t);
  console.log(`[i] Bot Token '${token}' registered!`);
}

function RemoveToken(token) {
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

function UpdateStats() {
  tokens.filter(t => !t.bot).forEach(t => t.user.updateStats());
  setTimeout(UpdateStats, 5000);
}

setTimeout(UpdateStats, 5000);

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
  AddBotUserToken
};
