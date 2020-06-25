const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const Config = require('../global/config.json');
var Database = require('../utils/Database/');
var Tokens = require('../global/TokenManager');
var UserActions = require('../utils/BanchoUtils/Packets/PacketConstants').userActions;

const server = https.createServer({
  key: fs.readFileSync(Config.certs.key),
  cert: fs.readFileSync(Config.certs.certificate)
});

var clients = [];

const wss = new WebSocket.Server({
  server
});

function ActionToString(actionID) {
  if(actionID == UserActions.idle) return "online";
  if(actionID == UserActions.afk) return "afk";
  if(actionID == UserActions.playing) return "playing";
  if(actionID == UserActions.editing) return "editing";
  if(actionID == UserActions.modding) return "modding";
  if(actionID == UserActions.multiplayer) return "multiplayer";
  if(actionID == UserActions.watching) return "watching";
  if(actionID == UserActions.unknown) return "unknown";
  if(actionID == UserActions.testing) return "testing";
  if(actionID == UserActions.submitting) return "submitting";
  if(actionID == UserActions.paused) return "paused";
  if(actionID == UserActions.lobby) return "mp-lobby";
  if(actionID == UserActions.multiplaying) return "multiplaying";
  if(actionID == UserActions.osuDirect) return "direct";

  return "unknown";
}

function UpdateUserStatus(user) {
  clients.filter(cl => cl.approved && cl.action == "listen-user-status" && cl.listening_user_id == user.user_id).forEach(client => {
    const obj = {
      "action": "user-card",
      "user_card": {
        "username": user.username,
        "rank": user.rank,
        "current_GameMode": user.gameMode,
        "action": ActionToString(user.actionID),
        "actionText": user.actionText,
      }
    };
    client.send(JSON.stringify(obj));
  });
}

function UpdateUserOffline(user) {
  clients.filter(cl => cl.approved && cl.action == "listen-user-status" && cl.listening_user_id == user.user_id).forEach(client => {
    const obj = {
      "action": "user-card",
      "user_card": {
        "username": user.username,
        "rank": user.rank,
        "current_gamemode": 0,
        "action": "offline",
        "actionText": "",
      }
    };

    client.send(JSON.stringify(obj));
  });
}

function UpdateSpectateUser(user, frames) {
  clients.filter(cl => cl.approved && cl.action == "spectate-user" && cl.spectating_user_id == user.user_id).forEach(client => {
    client.send(JSON.stringify({
      action: "spectate",
      status: 1, // SPECTATE FRAME
      frames
    }));
  });
}

async function onMessageUpdate(message) {
  message = JSON.parse(message);
  if (message.action == "listen-user-status") {
    this.action = "listen-user-status";
    this.listening_user_id = message["user-id"];
    if(!this.approved) {
      clients.push(this);
      this.approved = true;
    }

    if(!this.listening_user_id) return;
    var user = Tokens.FindUserID(this.listening_user_id);

    if (user) {
      UpdateUserStatus(user.user);
    } else {
      if(Database.GetUser(this.listening_user_id)) {
        UpdateUserOffline(Database.GetUser(this.listening_user_id));
      }
    }
  } else if (message.action == "spectate-user") {
    this.action = "spectate-user";
    this.spectating_user_id = message["user-id"];

    if(!this.approved) {
      clients.push(this);
      this.approved = true;
    }

    if(!this.spectating_user_id) return;
    var user = Tokens.FindUserID(this.spectating_user_id);

    if(user != undefined) {
      user.addSpectator(10);
      clients.filter(cl => cl.approved && cl.action == "spectate-user" && cl.spectating_user_id == message["user-id"]).forEach(client => {
        client.send(JSON.stringify({
          action: "spectate",
          status: 0 // SPECTATE STARTED
        }));
      });
    } else {
      clients.filter(cl => cl.approved && cl.action == "spectate-user" && cl.spectating_user_id == message["user-id"]).forEach(client => {
        client.send(JSON.stringify({
          action: "spectate",
          status: -1 // COULD NOT SPECTATE THIS USER
        }));
      });
    }
  }
}

const interval = setInterval(function() {
  wss.clients.forEach(function(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(() => {});
  });
}, 15000);

wss.on('connection', (ws, req) => {
  console.log("[i] Websocket connection received!");
  ws.ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(/\s*,\s*/)[0] : req.socket.remoteAddress;
  ws.isAlive = true;

  ws.on('message', onMessageUpdate);
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  ws.on('close', function() {
    console.log("[i] Websocket connection closed.");
    if(ws.action == "spectate-user") {
      console.log("spectator", ws);
      console.log((clients.filter(cl => cl.approved && cl.action == "spectate-user" && cl.spectating_user_id == ws.spectating_user_id).length - 1));
      if ((clients.filter(cl => cl.approved && cl.action == "spectate-user" && cl.spectating_user_id == ws.spectating_user_id).length - 1) <= 0) {
        Tokens.FindUserID(ws.spectating_user_id).removeSpectator(10);
      }
    }
  });
});

server.listen(Config.ports.websocket, () => console.log(`osu!katakuna websocket server listening on port ${Config.ports.websocket}`));

module.exports = {
  UpdateUserOffline,
  UpdateUserStatus,
  UpdateSpectateUser
}
