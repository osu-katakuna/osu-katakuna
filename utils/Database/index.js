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

  if(user.length < 1) return;
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

function GetRankPositionForUserID(id, gamemode = 0) {
  var all_users = con.query("SELECT * FROM users");
  var scores = all_users.map(u => ({ id: u.id, score: GetScoreForUserID(u.id, gamemode) }));

  if(scores.length >= 1) {
    scores.sort(function(a, b) {
        return a.score - b.score;
    });
    scores = scores.reverse();
    for(var i = 0; i < scores.length; i++) {
      if(scores[i].id == id) return i + 1;
    }
  }

  return 0;
}

function GetPlaysForUserID(id, gamemode = 0) {
  var scores = con.query("SELECT * FROM user_plays WHERE user_id = ? AND gameMode = ?", [id, gamemode]);
  if(scores && scores.length >= 1) return scores.length;

  return 0;
}

function GetScoreForUserID(id, gamemode = 0) {
  var final_score = 0;
  var scores = con.query("SELECT * FROM user_plays WHERE user_id = ? AND gameMode = ? AND pass = 1", [id, gamemode]);

  if(scores && scores.length >= 1) {
    scores.forEach(s => final_score += s.score);
  }

  return final_score;
}

function CalculateAccuracy(s, gameMode = 0) {
  var accuracy = 0;

  if(gameMode == 0) {
    // standard
    var totalPoints = s.count50 * 50 + s.count100 * 100 + s.count300 * 300;
    var totalHits = s.count300 + s.count100 + s.count50 + s.miss;
    if(totalHits == 0) accuracy = 1;
    else accuracy = totalPoints / (totalHits * 300);
  } else if(gameMode == 1) {
    // taiko
    var totalPoint = (s.count100 * 50) + (s.count300 * 100);
    var totalHits = s.miss + s.count100 + s.count300;
    if(totalHits == 0) accuracy = 1;
    else accuracy = totalPoints / (totalHits * 100);
  } else if(gameMode == 2) {
    // ctb
    var fruits = s.count300 + s.count100 + s.count50;
    var totalFruits = fruits + s.miss + s.countKatu;
    if(totalHits == 0) accuracy = 1;
    else accuracy = fruits / totalFruits;
  } else if(gameMode == 3) {
    // mania
    var totalPoints = s.count50 * 50 + s.count100 * 100 + s.countKatu * 200 + s.count300 * 300 + s.countGeki * 300;
    var totalHits = s.miss + s.count50 + s.count100 + s.count300 + s.countGeki + s.countKatu;

    accuracy = totalPoints / (totalHits * 300);
  }

  return Math.max(0.0, Math.min(1.0, accuracy));
}

function GetAccuracyForUserID(id, gamemode = 0) {
  var final_accuracy = 0.0;
  var scores = con.query("SELECT * FROM user_plays WHERE user_id = ? AND gameMode = ?", [id, gamemode]);

  if(scores && scores.length > 0) {
    if(scores.length > 2) {
      scores.forEach(s => final_accuracy += CalculateAccuracy(s, gamemode) * 100);
      final_accuracy /= scores.length;
    } else {
      final_accuracy += 70;
      scores.forEach(s => final_accuracy += CalculateAccuracy(s, gamemode) * 100);
      final_accuracy /= scores.length + 1;
    }
  }

  return final_accuracy;
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
  GetRankPositionForUserID,
  GetPlaysForUserID,
  GetScoreForUserID,
  GetAccuracyForUserID
};
