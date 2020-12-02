const sync_mysql = require('sync-mysql');
const mysql = require('mysql');
const User = require('../../models/User');
const Config = require('../../global/config.json');
const CountriesMap = require('../BanchoUtils/Packets/PacketConstants').countryCodes;

console.log("osu!katakuna database startup. Will perform DB connection right now!");

const con = new sync_mysql({
  host: Config.database.host,
  user: Config.database.username,
  password: Config.database.password,
  database:  Config.database.database
});

console.log("If you can see this, then probably osu!katakuna managed to connect to the database. Yey! :D");

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

function GetUserBanState(un) {
  var q = con.query("SELECT banned FROM users WHERE id = ? LIMIT 1", [un]);
  return q.length > 0 ? q[0].banned : false;
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
  __user.banned = user.banned;
  __user.country = user.country == null ? 0 : CountriesMap[user.country];
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

function GetConfigEntry(name) {
  return con.query("SELECT value FROM config WHERE name = ? LIMIT 1", [name])[0];
}

function SetConfigEntry(name, value) {
  if(GetConfigEntry(name) == undefined) {
    con.query("INSERT INTO config(name, value) VALUES(?, ?)", [name, value]);
  } else {
    con.query("UPDATE config SET name = ?, value = ? WHERE name = ?", [name, value, name]);
  }
}

function CheckIRCToken(username, token) {
  var user = con.query("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
  if(user.length <= 0) return false;

  var t = con.query("SELECT id FROM irc_token WHERE user_id = ? AND token = ? LIMIT 1", [user[0].id, token]);
  if(t.length > 0) return true;

  return false;
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
  GetUserStats,
  GetUserBanState,
  GetConfigEntry,
  SetConfigEntry,
  CheckIRCToken
};
