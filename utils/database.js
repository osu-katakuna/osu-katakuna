var sync_mysql = require('sync-mysql')
var mysql = require('mysql')
const ipInfo = require("node-ipinfo");
var c = require("../utils/bancho_constants");
console.log("########################################### DATABASE INIT #################################################")

var con = new sync_mysql({
  host: "localhost",
  user: "USERNAME",
  password: "PASSWORD",
  database: 'osu_katakuna'
});

function checkUser(user, pass) {
  var user = con.query(`SELECT * FROM users WHERE username = ${mysql.escape(user)} AND password_hash = ${mysql.escape(pass)} LIMIT 1`);

	if(user.length >= 1) return true;
	else return false;
}

function unconfiguredMapSets() {
  return con.query("SELECT * FROM beatmap_sets WHERE aim IS NULL AND speed IS NULL");
}

function setBeatmapSetStats(beatmap_set_id, aim, speed) {
  console.log(aim, beatmap_set_id, speed)
  con.query("UPDATE beatmap_sets SET aim = ?, speed = ? WHERE id = ?", [aim, speed, beatmap_set_id]);
}

function getDiffData(map, diff) {
  return con.query("SELECT * FROM beatmap_sets WHERE beatmap_id = ? AND name = ?", [map, diff])[0];
}

function getUserID(user, pass) {
  return con.query(`SELECT id FROM users WHERE username = ${mysql.escape(user)} AND password_hash = ${mysql.escape(pass)} LIMIT 1`)[0].id;
}

function getUserFromToken(token) {
  return con.query(`SELECT users.id, users.username, users.email, users.avatar, users.created_at, users.updated_at FROM users AS users INNER JOIN tokens as tokens ON (users.id = tokens.user_id AND tokens.token_id = ${mysql.escape(token)})`)[0];
}

function getAllOnlineUsers() {
  return con.query(`SELECT users.id, users.username, users.email, users.avatar, users.created_at, users.updated_at, tokens.token_id FROM users AS users INNER JOIN tokens as tokens ON (users.id = tokens.user_id)`);
}

function userHasToken(uid) {
  return con.query(`SELECT user_id FROM tokens WHERE user_id = ${mysql.escape(uid)}`)[0] != undefined;
}

function getUserTokenData(uid) {
  var x = con.query(`SELECT * FROM tokens WHERE user_id = ${mysql.escape(uid)}`)[0];
  if(x) return x;
  return undefined;
}

function getUserToken(uid) {
  var x = con.query(`SELECT token_id FROM tokens WHERE user_id = ${mysql.escape(uid)}`)[0];
  if(x) return x.token_id;
  return undefined;
}

function getCurrentTimeDate() {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

function setUserToken(uid, token, ip) {
  console.log("set token:", uid, token, ip)
  var time = getCurrentTimeDate();
  if(!userHasToken(uid)) {
    con.query(`INSERT INTO tokens(user_id, token_id, created_at, updated_at, ip) VALUES (${mysql.escape(uid)}, ${mysql.escape(token)}, ${mysql.escape(time)}, ${mysql.escape(time)}, ${mysql.escape(ip)})`);
  } else {
    con.query(`UPDATE tokens SET token_id = ${mysql.escape(token)}, updated_at = ${mysql.escape(time)}, ip = ${mysql.escape(ip)} WHERE user_id = ${mysql.escape(uid)}`);
  }
}

function removeUserTokens(uid) {
  con.query(`DELETE FROM tokens WHERE user_id = ${mysql.escape(uid)}`);
}

function getUserStats(id) {
  var u = find_user(id);
  if(u) return u.stats;
  return undefined;
}

function find_user_name_id(un) {
  var user = con.query(`SELECT id FROM users WHERE username = ${mysql.escape(un)} LIMIT 1`);
  if(user.length >= 1) {
    return user[0].id;
  }
}

function getFriendsForUserID(me) {
  var friends = [];
  con.query("SELECT friend FROM user_friendships WHERE user = ?", [me]).forEach((f) => friends.push(f.friend));
  return friends;
}

function find_user(id) {
  var user = con.query(`SELECT * FROM users WHERE id = ${mysql.escape(id)} LIMIT 1`);
  if(user.length >= 1) {
    var msgs = con.query(`SELECT __from.id, __from.username, private_message.message FROM users AS __from INNER JOIN private_message as private_message ON (__from.id = private_message.from_user_id AND private_message.to_user_id = ${mysql.escape(id)} AND private_message.seen = 0)`);
    var token_data = getUserTokenData(id);

    user = user[0];
    const User = require('../models/User');
    var u = new User();

    u.username = user.username;
    u.user_id = user.id;
    u.email = user.email;
    u.avatar = user.avatar;
    u.totalScore = 123456;
    u.online = token_data != undefined;
    u.token = token_data;
    u.friends = getFriendsForUserID(user.id)
    if(token_data) {
      console.log(`Token identified IP & forcing RO: ${token_data.ip}`);
      u.country = 43;
    }
    u.private_messages = msgs;

    return u;
  }
  return undefined;
}

function setMessageSeen(data) {
  con.query(`UPDATE private_message SET seen = 1, updated_at = ${mysql.escape(getCurrentTimeDate())} WHERE from_user_id = ${mysql.escape(data.from)} AND to_user_id = ${mysql.escape(data.to)} AND message = ${mysql.escape(data.message)}`);
}

function getPMsForUser(uid) {
  var u = find_user(uid);
  if(u) {
    u.private_messages.forEach((msg) => {
      var m = {
        "from": msg.id,
        "to": uid,
        "message": msg.message
      };
      setMessageSeen(m);
    });
    return u.private_messages;
  } else {
    console.log("not found UID");
    return [];
  }
}

function addMessage(from, msg) {
  con.query(`INSERT INTO private_message(from_user_id, to_user_id, message, seen, created_at, updated_at) VALUES (${mysql.escape(from.id)}, ${mysql.escape(find_user_name_id(msg.channel))}, ${mysql.escape(msg.message)}, ${0}, ${mysql.escape(getCurrentTimeDate())}, ${mysql.escape(getCurrentTimeDate())})`);
}

function addFriend(me, friend) {
  var data = getCurrentTimeDate();
  con.query("INSERT INTO user_friendships (user, friend, created_at, updated_at) VALUES (?, ?, ?, ?)", [me, friend, data, data]);
}

function removeFriend(me, friend) {
  con.query("DELETE FROM user_friendships WHERE user = ? AND friend = ?", [me, friend]);
}

module.exports = {
  "checkUser": checkUser,
  "getUserID": getUserID,
  "getUserStats": getUserStats,
  "find_user": find_user,
  "getAllOnlineUsers": getAllOnlineUsers,
  "userHasToken": userHasToken,
  "getUserToken": getUserToken,
  "setUserToken": setUserToken,
  "getUserFromToken": getUserFromToken,
  "removeUserTokens": removeUserTokens,
  "getPMsForUser": getPMsForUser,
  "addMessage": addMessage,
  "find_user_name_id": find_user_name_id,
  "getUserTokenData": getUserTokenData,
  "unconfiguredMapSets": unconfiguredMapSets,
  "setBeatmapSetStats": setBeatmapSetStats,
  "getCurrentTimeDate": getCurrentTimeDate,
  "getDiffData": getDiffData,
  "addFriend": addFriend,
  "removeFriend": removeFriend
};
