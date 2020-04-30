const sync_mysql = require('sync-mysql');
const mysql = require('mysql');
const User = require('../../models/User');
const Config = require('../../global/config.json');

var con = new sync_mysql({
  host: Config.database.host,
  user: Config.database.username,
  password: Config.database.password,
  database:  Config.database.database
});

function GetUserFriends(user_id) {
  return con.query("SELECT * FROM user_friendships WHERE user = ?", [user_id]).map(f => f.friend);
}

function GetUserMessages(user_id) {
  return con.query("SELECT * FROM private_message WHERE to_user_id = ? AND seen = 0", [user_id]);
}

function AddFriendForUser(user, friend) {
  con.query("INSERT IGNORE INTO user_friendships(user, friend, created_at, updated_at) VALUES(?, ?, ?, ?)", [user.user_id, friend.user_id, getCurrentTimeDate(), getCurrentTimeDate()]);
}

function RemoveFriendForUser(user, friend) {
  con.query("DELETE FROM user_friendships WHERE user = ? AND friend = ?", [user.user_id, friend.user_id]);
}

function SaveMessage(from, message, to) {
  con.query("INSERT INTO private_message (from_user_id, to_user_id, message, seen, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)", [from.user_id, to.user_id, message, getCurrentTimeDate(), getCurrentTimeDate()]);
}

function SetMessageSeen(id) {
  con.query("UPDATE private_message SET seen = 1, updated_at = ? WHERE id = ?", [getCurrentTimeDate(), id]);
}

function TokenUser(token) {
  const tokens = con.query("SELECT user_id FROM tokens WHERE token_id = ? LIMIT 1", [token]);
  return tokens.length > 0 ? GetUser(tokens[0].user_id) : undefined;
}

function getCurrentTimeDate() {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

function SetUserToken(uid, token, ip) {
  var time = getCurrentTimeDate();
  if(!GetUser(uid).token) {
    con.query("INSERT INTO tokens(user_id, token_id, created_at, updated_at, ip) VALUES (?, ?, ?, ?, ?)", [uid, token, time, time, ip]);
  } else {
    con.query("UPDATE tokens SET token_id = ?, updated_at = ?, ip = ? WHERE user_id = ?", [token, time, ip, uid]);
  }
}

function RemoveUserTokens(uid) {
  con.query("DELETE FROM tokens WHERE user_id = ?", [uid]);
}

function GetAllTokens() {
  return con.query("SELECT user_id, token_id, ip FROM tokens");
}

function GetUser(un) {
  const user = con.query("SELECT * FROM users WHERE username = ? OR id = ? LIMIT 1", [un, un])[0];

  if(user == undefined || user.length < 1) return;
  const token_data = con.query("SELECT * FROM tokens WHERE user_id = ? LIMIT 1", [user.id])[0];
  const __user = new User();

  __user.username = user.username;
  __user.user_id = user.id;
  __user.email = user.email;
  __user.avatar = user.avatar;
  __user.database = this;
  if(token_data)
    __user.token = token_data.token_id;
  __user.friends = GetUserFriends(user.id);

  return __user; // model user
}

function ValidateLogin(username, password) {
  const user = con.query(`SELECT * FROM users WHERE username = ? AND password_hash = ? LIMIT 1`, [username, password]);
  return user.length >= 1;
}

function RemoveAllTokens() {
  con.query("DELETE FROM tokens WHERE 1");
}

function GetAllUsersStats() {
  return con.query("SELECT * FROM user_stats");
}

function GetUserStats(user_id) {
  return con.query("SELECT * FROM user_stats WHERE user_id = ?", [user_id]);
}

module.exports = {
  GetUser,
  ValidateLogin,
  TokenUser,
  SetUserToken,
  GetUserMessages,
  SaveMessage,
  SetMessageSeen,
  AddFriendForUser,
  RemoveFriendForUser,
  RemoveUserTokens,
  GetAllTokens,
  RemoveAllTokens,
  GetAllUsersStats,
  GetUserStats
};
