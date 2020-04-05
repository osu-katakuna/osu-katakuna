const TokenManager = require('./TokenManager');
const Packets = require('../utils/BanchoUtils/Packets');
const Match = require('../models/Match').Match;

var matches = [];
var PlayersInLobby = require("./GlobalLobbyPlayers").PlayersInLobby;

function GetPlayerID(id) {
  for(var i = 0; i < PlayersInLobby.length; i++) {
    if(PlayersInLobby[i] == id) return TokenManager.FindUserID(id);
  }
}

function PlayerInLobby(user) {
  for(var i = 0; i < PlayersInLobby.length; i++) {
    if(PlayersInLobby[i] == user.user_id) return true;
  }
  return false;
}

function GetMatch(id) {
  return matches.filter(m => m.id == id)[0];
}

function GetRandomMatchID() {
  var m = 1;
  while(true) {
    if(!GetMatch(m)) return m;
    m++;
  }
}

function CreateMatch(user, match_data) {
  var m = new Match;
  m.name = match_data.name;
  m.id = GetRandomMatchID();
  m.hostUserID = match_data.hostUserID;
  m.password = match_data.password == "" ? null : match_data.password;
  m.beatmapName = match_data.beatmapName;
  m.beatmapMD5 = match_data.beatmapMD5;
  m.beatmapID = match_data.beatmapID;
  match_data.slots.forEach((slot, i) => {
    m.slots[i].status = slot.status;
    m.slots[i].team = slot.team;
    m.slots[i].userID = slot.id;
  });
  matches.push(m);

  console.log(`[i] Created match #${m.id} - owner: ${user.username}`);

  TokenManager.EnqueueToMultiple(PlayersInLobby, Packets.NewMatchInfo(m)); // send to players currently in lobby information about this new match lobby
  JoinMatch(user, m.id, m.password);
  m.SetHost(user);
}

function JoinMatch(user, match_id, password) {
  if(GetMatch(match_id)) {
    const match = GetMatch(match_id);
    if(match.password != null && match.password != password) {
      TokenManager.FindUserID(user.user_id).enqueue(Packets.MatchJoinFailure());
      console.log(`[X] ${user.username} tried to join match #${match.id}, but used an incorrect password!`);
    } else {
      match.JoinUser(user);
      console.log(`[i] ${user.username} joined #${match.id}!`);
    }
  } else {
    console.log(`[X] ${user.username} tried to join an inexistent match #${match.id}.`);
  }
}

function LeaveMatch(user, match_id) {
  if(GetMatch(id)) {

  }
}

function JoinLobby(user) {
  if(GetPlayerID(user.user_id)) {
    console.log(`[i] User ${user.username} joined the lobby already!`);
    return;
  }
  PlayersInLobby.push(user.user_id);
  console.log(`[i] User ${user.username} joined the lobby!`);
}

function LeaveLobby(user) {
  PlayersInLobby = PlayersInLobby.filter(p => p != user.user_id);
  console.log(`[i] User ${user.username} left the lobby!`);
}

module.exports = {
  GetPlayerID,
  PlayerInLobby,
  GetMatch,
  JoinLobby,
  LeaveLobby,
  matches,
  CreateMatch,
  JoinMatch,
  LeaveMatch
};
