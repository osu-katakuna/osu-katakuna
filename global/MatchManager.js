const TokenManager = require('./TokenManager');
const Packets = require('../utils/BanchoUtils/Packets');

var { Matches, PlayersInLobby } = require("./GlobalLobbyPlayers");

const Match = require('../models/Match').Match;

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
  return Matches.filter(m => m.id == id)[0];
}

function GetUserJoinedMatch(user) {
  for(var i = 0; i < Matches.length; i++) {
    for(var j = 0; j < 16; j++)
      if(Matches[i].GetSlot(j).userID == user.user_id) return Matches[i];
  }
}

function GetRandomMatchID() {
  var m = 1;
  while(true) {
    if(!GetMatch(m)) return m;
    m++;
  }
}

function GetAllMatches() {
  return Matches.filter(m => !m.deleted);
}

function DestroyMatch(match) {
  console.log(`[i] Destroying MP-${match.id}`);
  var newMatches = [];
  for(var i = 0; i < Matches.length; i++) {
    if(Matches[i] && Matches[i].id == match.id) {
      Matches[i].deleted = true;
      delete Matches[i];
      Matches.splice(i, 1);
    } else {
      if(Matches[i]) {
        newMatches.push(Matches[i]);
      }
    }
  }

  Matches = newMatches;
}

function UpdateMatch(user, match_data) {
  if(GetMatch(match_data.matchID)) {
    var m = GetMatch(match_data.matchID);

    if(user.user_id != m.hostUserID) {
      console.log(`[X] Could not update match #${match_data.id}: you are not the host!`);
      return;
    }

    m.name = match_data.name;
    m.password = match_data.password == "" ? null : match_data.password.slice(0, match_data.length - 9);
    m.beatmapName = match_data.beatmapName;
    m.beatmapMD5 = match_data.beatmapMD5;
    m.beatmapID = match_data.beatmapMD5 == "" ? 0 : match_data.beatmapID;
    m.matchScoringType = match_data.scoringType;
    m.matchTeamType = match_data.teamType;
    m.matchModMode = match_data.freeMods;
    m.gameMode = match_data.gameMode;
    m.mods = match_data.mods;
    for(var i = 0; i < 16; i++) {
      var slot = m.GetSlot(i);
      slot.status = match_data.slots[i].status;
      slot.userID = match_data.slots[i].userID;
      slot.team = match_data.slots[i].team;

      m.SetSlot(i, slot);
    }
    m.SendUpdate();
  } else {
    console.log(`[X] Could not update inexistent match #${match_data.id}!`);
  }
}

function CreateMatch(user, match_data) {
  var m = new Match;
  m.name = match_data.name;
  m.id = GetRandomMatchID();
  m.hostUserID = user.user_id;
  if(match_data.password == "//private") {
    match_data.password = "";
  } else {
    if(match_data.password.slice(match_data.password.length - 9) == "//private") {
      match_data.password = match_data.password.slice(0, match_data.password.length - match_data.password.lastIndexOf("//private"));
    }
  }
  m.password = match_data.password == "" ? null : match_data.password;
  m.beatmapName = match_data.beatmapName;
  m.beatmapMD5 = match_data.beatmapMD5;
  m.beatmapID = match_data.beatmapID;
  m.matchScoringType = match_data.scoringType;
  m.matchTeamType = match_data.teamType;
  m.matchModMode = match_data.freeMods;
  m.gameMode = match_data.gameMode;
  m.mods = match_data.mods;
  for(var i = 0; i < 16; i++) {
    var slot = m.GetSlot(i);
    slot.status = match_data.slots[i].status;
    slot.userID = match_data.slots[i].userID;
    slot.team = match_data.slots[i].team;

    m.SetSlot(i, slot);
  }
  Matches.push(m);

  console.log(`[i] Created match #${m.id} - owner: ${user.username}`);

  TokenManager.EnqueueToMultiple(PlayersInLobby, Packets.NewMatchInfo(m)); // send to players currently in lobby information about this new match lobby
  JoinMatch(user, m.id, m.password);
  m.SetHost(user);
}

function JoinMatch(user, match_id, password) {
  if(GetMatch(match_id)) {
    const match = GetMatch(match_id);
    LeaveLobby(user);
    if(match.password != null && match.password != password) {
      TokenManager.FindUserID(user.user_id).enqueue(Packets.MatchJoinFailure());
      console.log(`[X] ${user.username} tried to join match #${match.id}, but used an incorrect password!`);
    } else {
      match.JoinUser(user);
      console.log(`[i] ${user.username} joined #${match.id}!`);
    }
  } else {
    TokenManager.FindUserID(user.user_id).enqueue(Packets.MatchJoinFailure());
    console.log(`[X] ${user.username} tried to join an inexistent match #${match.id}.`);
  }
}

function LeaveMatch(user, match_id) {
  if(GetUserJoinedMatch(user)) {
    var match = GetUserJoinedMatch(user);
    match.RemoveUser(user);
    if(match.OnlinePlayers == 0) {
      console.log(`[i] No players left in joined MP lobby! Destroying match MP-${match.id}...`);
      DestroyMatch(match);
      TokenManager.FindUserID(user.user_id).enqueue(Packets.DisposeMatch(match));
      TokenManager.EnqueueToMultiple(PlayersInLobby, Packets.DisposeMatch(match));
    }
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
  Matches,
  CreateMatch,
  JoinMatch,
  LeaveMatch,
  UpdateMatch,
  DestroyMatch,
  GetAllMatches,
  GetUserJoinedMatch
};
