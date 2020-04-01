const ipc = require('node-ipc');
const Packets = require('./BanchoUtils/Packets')
const PacketConstant = require('./BanchoUtils/Packets/PacketConstants')
const Database = require('./Database/');
const Tokens = require('../global/global').tokens;
const User = require('../models/User');
var uuid = require("uuid").v4;

const handlers = [
  {"action": "request", "type": "user", "handler": (id, socket, req) => {
    var user = Tokens.FindUsernameToken(req.name) != undefined ? Tokens.FindUsernameToken(req.name).user : Database.GetUser(req.name);
    if(!user) {
      ipc.server.emit(socket, 'katakuna.action', {
          id: id,
          data: {
            operation: "NotFound"
          }
      });
    } else {
      user.online = Tokens.FindUsernameToken(req.name) != undefined;
      ipc.server.emit(socket, 'katakuna.action', {
          id: id,
          data: {
            response: user,
            operation: "ok"
          }
      });
    }
  }},
  {"action": "action", "type": "troll", "handler": (id, socket, req) => {
    var token = Tokens.FindUserID(req.user_id);
    if(!token) {
      ipc.server.emit(socket, 'katakuna.action', {
          id: id,
          data: {
            operation: "NotOnline"
          }
      });
    } else {
      var packet = undefined;

      if(req.mode == "notification") {
        packet = Packets.Notification(req.message);
      } else if(req.mode == "jumpscare") {
        packet = Packets.Jumpscare(req.message);
      } else if(req.mode == "chat_attention") {
        packet = Packets.GetChatAttention();
      } else if(req.mode == "force_exit") {
        packet = Packets.ForceExit();
      }

      if(packet) token.enqueue(packet);
      ipc.server.emit(socket, 'katakuna.action', {
          id: id,
          data: {
            operation: "ok"
          }
      });
    }
  }},
  {"action": "register", "type": "bot", "handler": (id, socket, req) => {
    if(Tokens.FindUserID(id)) {
        console.log("[X] Register failed; bot exists.");
        ipc.server.emit(socket, 'katakuna.action', {
            id: id,
            data: {
              operation: "BotExists"
            }
        });
        return;
    }

    req.user_data.token = id;
    req.user_data.status = {
      "id": PacketConstant.userActions.watching,
      "text": "Twitch",
    };

    var user = CreateBotUser(req.user_data);
    Tokens.AddUserToken(user, id);
    Tokens.EnqueueAll(Packets.UserPanel(user));
    Tokens.EnqueueAll(Packets.UserStats(user));

    ipc.server.emit(socket, 'katakuna.action', {
        id: id,
        data: {
          operation: "ok",
          token: id
        }
    });
  }}
];

function CreateBotUser(user) {
  var u = new User();

  u.username = user.name;
  u.user_id = user.id;
  u.email = "";
  u.avatar = user.avatar;
  u.totalScore = user.totalScore;
  u.rankedScore = user.rankedScore;
  u.online = true;
  u.country = user.country;
  u.private_messages = [];

  if(user.status) {
    u.setStatus(user.status.id, user.status.text, "", 0)
  }

  return u;
}

function start_ipc(start_cb) {
  ipc.config.id = 'katakuna';
  ipc.config.retry = 1500;

  ipc.serve("/tmp/katakuna-if", () => {
    ipc.server.on('katakuna.action', (data, socket) => {
      const msg_id = data.id;
      console.log("## Received message from process with id " + msg_id + "... ##");
      console.log(`## Action: ${data.data.type}; Type: ${data.data[data.data.type].type} ##`)
      for(var i = 0; i < handlers.length; i++) {
        if(handlers[i].action == data.data.type && handlers[i].type == data.data[data.data.type].type) {
          handlers[i].handler(msg_id, socket, data.data[data.data.type]);
          break;
        }
      }
    });
    ipc.server.on("socket.disconnected", (sock, id) => {
      console.log("## socket disconnected! ##");
      const bot = Tokens.FindUserToken(id);
      if(bot) {
        console.log(`[i] ${bot.user.username} with id ${id} disconnected! Removing user!`)
        Tokens.RemoveToken(id);
        Tokens.EnqueueAll(Packets.UserLogout(bot.user));
      }
    });
    start_cb();
  });

  ipc.server.start();
}

module.exports = {
  "start_ipc": start_ipc
};
