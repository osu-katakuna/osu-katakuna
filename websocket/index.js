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

function cl() {
  if (wss.clients.length == 0) return;

  wss.clients.forEach(cl => {
    if (!cl.approved) {
      console.log("Client not approved; deleting", cl.ip);
      cl.terminate();
    }
  });

  if (wss.clients.length == 0) return;
  setTimeout(cl, 5000);
}

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

function onMessageUpdate(message) {
  message = JSON.parse(message);
  if (message.action == "listen-user-status") {
    this.approved = true;
    this.action = "listen-user-status";
    this.listening_user_id = message["user-id"];
    clients.push(this);

    var user = Tokens.FindUserID(this.listening_user_id);

    if (user) {
      UpdateUserStatus(user.user);
    } else {
      UpdateUserOffline(Database.GetUser(this.listening_user_id));
    }
  }
}

wss.on('connection', (ws, req) => {
  console.log("Connection received!");
  ws.ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(/\s*,\s*/)[0] : req.socket.remoteAddress;

  ws.on('message', onMessageUpdate);

  if (wss.clients.length === undefined || wss.clients.length > 0) {
    setTimeout(cl, 5000);
  }
});

wss.on('close', function(c) {
  console.log(c);
});

server.listen(Config.ports.websocket, () => console.log(`osu!katakuna websocket server listening on port ${Config.ports.websocket}`));

module.exports = {
  UpdateUserOffline,
  UpdateUserStatus
}
