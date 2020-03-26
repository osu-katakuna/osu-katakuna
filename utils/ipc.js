const ipc = require('node-ipc');
var protocol = require('./bancho_protocol')
const db = require("./database")
var cmd_queue = require("./queue");
const User = require('../models/User.js')
var uuid = require("uuid").v4;

const handlers = [
  {"action": "request", "type": "user", "handler": (id, socket, req) => {
    var user_id = db.find_user_name_id(req.name);
    if(!user_id) {
      ipc.server.emit(socket, 'katakuna.action', {
          id: id,
          data: {
            operation: "NotFound"
          }
      });
    } else {
      var user = db.find_user(user_id);
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
    var token = db.getUserToken(req.user_id);
    console.log("token", token);
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
        packet = protocol.generator.notification(req.message);
      } else if(req.mode == "jumpscare") {
        packet = protocol.generator.jumpscare(req.message);
      } else if(req.mode == "chat_attention") {
        packet = protocol.generator.getAttention();
      } else if(req.mode == "force_exit") {
        packet = protocol.generator.forceExit();
      }

      if(packet) cmd_queue.queueTo(token, packet);
      ipc.server.emit(socket, 'katakuna.action', {
          id: id,
          data: {
            operation: "ok"
          }
      });
    }
  }},
  {"action": "register", "type": "bot", "handler": (id, socket, req) => {
    console.log("Bot registration!");
    var token = uuid();

    for(var i = 0; i < registered_users.length; i++) {
      if(registered_users[i].id == req.user_data.id) {
        console.log("Register failed; bot exists.");
        ipc.server.emit(socket, 'katakuna.action', {
            id: id,
            data: {
              operation: "BotExists"
            }
        });
        return;
      }
    }

    req.user_data.token = token;
    req.user_data.sock_id = id;
    req.user_data.status = {
      "id": protocol.constants.userActions.watching,
      "text": "pe ma-ta haha",
      "mods": 0
    };
    registered_users.push(req.user_data);

    var user = getBotUser(req.user_data.id);
    cmd_queue.queueAll(protocol.generator.userPanel(user));
    cmd_queue.queueAll(protocol.generator.userStats(user.stats));

    ipc.server.emit(socket, 'katakuna.action', {
        id: id,
        data: {
          operation: "ok",
          token: token
        }
    });
  }}
];

var registered_users = [];

function getBotUser(id) {
  var bots = [];
  for(var i = 0; i < registered_users.length; i++) {
    var user = registered_users[i];
    if(user.id != id) continue;

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
      u.setStatus(user.status.id, user.status.text, "", user.status.mods)
    }

    return u;
  }
}

function getBotUsers() {
  var bots = [];
  for(var i = 0; i < registered_users.length; i++) {
    var user = registered_users[i];
    console.log("user", user);
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
      u.setStatus(user.status.id, user.status.text, "9e83c42f0f8ec2bb16e34b10aab30cf1", user.status.mods)
    }

    bots.push(u);
  }
  return bots;
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
      var bot = registered_users.filter(user => (user.sock_id == id))[0];
      if(bot) {
        console.log(`${bot.name} with id ${id} disconnected! Removing user!`)
        registered_users = registered_users.filter(user => !(user.sock_id == id));
        cmd_queue.queueAll(protocol.generator.userLogout(bot.id));
      }
    });
    start_cb();
  });

  ipc.server.start();
}

module.exports = {
  "start_ipc": start_ipc,
  "getBotUsers": getBotUsers,
  "getBotUser": getBotUser
};
