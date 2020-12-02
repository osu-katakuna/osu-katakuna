const net = require('net');
const fs = require('fs');
const path = require('path');
const uuid = require("uuid").v4;
const ChannelManager = require("../global/global").channels;
const TokenManager = require("../global/global").tokens;
const Config = require('../global/config.json');
const Database = require('../utils/Database/');
const Misaki = require('../misaki/bot');

const host = "yuki";
const hostname = `${host}@katakuna`;
const version = "1.0";
const date = "Tue Jul 7 2020 at 02:10:47 UTC";

function onUserLogin(socket) {
  socket.token = uuid();
  // to do: alert all users of new user.
  socket.write(`:${hostname} 001 ${socket.username} :Welcome to the katakuna!yuki Network, ${socket.username}!${hostname}\r\n`);
  socket.write(`:${hostname} 002 ${socket.username} :Your host is ${hostname}, running version ${version}\r\n`);
  socket.write(`:${hostname} 003 ${socket.username} :This server was created ${date}\r\n`);
  socket.write(`:${hostname} 004 ${socket.username} yuki ${version}\r\n`);
  cmds.filter(c => c.command == "MOTD")[0].call({socket});

  socket.write(`:${hostname} MODE ${socket.username} +i\r\n`);

  if(!TokenManager.FindUserID(socket.user.user_id)) {
    const user = Database.GetUser(socket.username);
    TokenManager.AddIRCToken(user, socket.token, socket);
  }

  cmds.filter(c => c.command == "JOIN")[0].call({socket, arguments: ["#osu"]});
  cmds.filter(c => c.command == "JOIN")[0].call({socket, arguments: ["#announce"]});
  cmds.filter(c => c.command == "JOIN")[0].call({socket, arguments: ["#lobby"]});
}

const cmds = [
  {
    command: "MOTD",
    call: function({socket}) {
      socket.write(`:${socket.username} 375 ${socket.username} :- ${hostname} Message of the day - \r\n`);
      try {
          const data = fs.readFileSync(path.resolve(path.dirname(require.main.filename), "./global/motd-yuki"), 'UTF-8');
          const lines = data.split(/\r?\n/);
          lines.forEach((line) => socket.write(`:${socket.username} 372 ${socket.username} :${line}\r\n`));
      } catch (err) {
          console.error(err);
      }
      socket.write(`:${hostname} 376 ${socket.username} :End of /MOTD command.\r\n`);
    }
  },
  {
    command: "PASS",
    min_args: 1,
    required_at_auth: true,
    call: function({socket, arguments}) {
      if(arguments.length < 1) {
        console.log("[IRC] NO PASSWORD PROVIDED.");
        socket.write(`:${hostname} 464 ${socket.username} :Password incorrect\r\n`);
        return;
      }

      socket.password = arguments.join(" ");
      console.log("[IRC] Password set.");
    }
  },
  {
    command: "NICK",
    call: function({socket, arguments}) {
      if(socket.authenticated && arguments[0] !== socket.username) {
        console.log("[IRC] " + socket.username + " has no rights to change his username.");
        socket.write(`:${hostname} NOTICE * :You are not allowed to change your username!\r\n`);
        socket.write(`:${hostname} NICK ${socket.username}\r\n`);
      } else {
        socket.username = arguments.join(" ");
        console.log("[IRC] Username set: " + socket.username);
      }
    }
  },
  {
    command: "PING",
    call: function({socket, arguments}) {
      console.log("[IRC] PING request from " + socket.username);
      if(TokenManager.FindUserToken(socket.token) == null) {
        socket.write(`:${socket.username} 464 ${socket.username} :Invalid Session!\r\n`);
        socket.write(`:${hostname} NOTICE * :Please reconnect.\r\n`);
        console.log(`[IRC] Token was invalidated...`);
        socket.destroy();
        return;
      }
      TokenManager.FindUserToken(socket.token).lastEvent = new Date().getTime();
      socket.write(`:${hostname} PONG ${hostname} ${arguments[0]}\r\n`);
    }
  },
  {
    command: "USER",
    required_at_auth: true,
    call: function({socket, arguments}) {
      console.log(`[IRC] '${socket.username}' is going to authenticate...`);

      if(!Database.CheckIRCToken(socket.username, socket.password)) {
        socket.write(`:${socket.username} 464 ${socket.username} :Invalid Login Data!\r\n`);
        socket.write(`:${hostname} NOTICE * :Please try to use an valid token/username. You can get it from your profile settings page: https://katakuna.cc/profile/manage/irc\r\n`);
        console.log(`[IRC] '${socket.username}' failed to authenticate...`);
        socket.destroy();
      } else {
        if(!TokenManager.FindUsernameToken(socket.username)) {
          socket.authenticated = true;
          socket.user = {};
          socket.user.user_id = 1000;

          onUserLogin(socket);
          console.log(`[IRC] '${socket.username}' authenticated successfully!`);
        } else {
          console.log(`[IRC] '${socket.username}' authenticated successfully, but it's still connected in-game!`);
          socket.write(`:${hostname} NOTICE * :You are still connected in-game. Please disconnect from there to proceed connecting to katakuna!yuki. If you just disconnected from the game, wait 3 minutes before trying again.\r\n`);
          socket.destroy();
        }
      }
    }
  },
  {
    command: "QUIT",
    call: function({socket, arguments}) {
      console.log(`[IRC] '${socket.username}' is quiting the server.`);
      socket.destroy();
    }
  },
  {
    command: "LIST",
    call: function({socket, arguments}) {
      socket.write(`:${hostname} 321 ${socket.username} Channel :Users  Name\r\n`);
      ChannelManager.GetAllChannels().forEach(c => {
        socket.write(`:${hostname} 322 ${socket.username} ${c.name} ${c.members.length > 0 ? c.members.length : 1} :${c.description ? c.description : "No description provided."}\r\n`);
      });
      socket.write(`:${hostname} 323 ${socket.username} :End of /LIST\r\n`);
    }
  },
  {
    command: "JOIN",
    min_args: 1,
    call: function({socket, arguments}) {
      var t = TokenManager.FindUserToken(socket.token);
      if(t) {
        ChannelManager.JoinChannel(arguments[0], t.user);
      }
    }
  },
  {
    command: "MODE",
    min_args: 1,
    call: function({socket, arguments}) {
      if(ChannelManager.GetChannel(arguments[0])) {
        socket.write(`:${hostname} 324 ${socket.username} ${arguments[0]} +nt\r\n`);

        var users = "";
        ChannelManager.GetChannel(arguments[0]).members.map(id => {
          var u = TokenManager.FindUserID(id);
          return (u.bot ? "@" : "") + u.user.username;
        }).forEach(m => { users += `${m} `; });
        users = users.substr(0, users.length - 1);

        if(Config.misaki && Config.misaki.enabled) {
          users += " @" + Database.GetUser(Config.misaki.userid).username;
        }

        socket.write(`:${hostname} 353 ${socket.username} = ${arguments[0]} :${users}\r\n`);
        socket.write(`:${hostname} 366 ${socket.username} ${arguments[0]} :End of /NAMES list.\r\n`);
      }
    }
  },
  {
    command: "NAMES",
    min_args: 1,
    call: function({socket, arguments}) {
      if(ChannelManager.GetChannel(arguments[0])) {
        var users = "";
        ChannelManager.GetChannel(arguments[0]).members.map(id => {
          var u = TokenManager.FindUserID(id);
          return (u.bot ? "@" : "") + u.user.username;
        }).forEach(m => { users += `${m} `; });
        users = users.substr(0, users.length - 1);

        if(Config.misaki && Config.misaki.enabled) {
          users += " @" + Database.GetUser(Config.misaki.userid).username;
        }

        socket.write(`:${hostname} 353 ${socket.username} = ${arguments[0]} :${users}\r\n`);
        socket.write(`:${hostname} 366 ${socket.username} ${arguments[0]} :End of /NAMES list.\r\n`);
      }
    }
  },
  {
    command: "PRIVMSG",
    min_args: 2,
    call: function({socket, arguments}) {
      var message = arguments.slice(1).join(" ");
      message = message.substr(1, message.length);

      if(arguments[0][0] == '#') {
        // its an channel
        if((Config.misaki && Config.misaki.enabled) && message.startsWith(Config.misaki.prefix ? Config.misaki.prefix : '!')) {
          if(Misaki.CheckIfShowMessage({message, channel: arguments[0]})) {
            ChannelManager.SendMessage(arguments[0], message, TokenManager.FindUserToken(socket.token).user);
          }
          Misaki.ProcessMessage(TokenManager.FindUserToken(socket.token), {message, channel: arguments[0]})
        } else {
          ChannelManager.SendMessage(arguments[0], message, TokenManager.FindUserToken(socket.token).user);
        }
      }
    }
  }
];

var server = net.createServer(function(socket) {
  socket.authenticated = false;
  socket.username = "guest";
  socket.realname = "guest";
  socket.__hostname = hostname;

  socket.on("error", function() {});

  socket.on("close", function() {
		console.log("[x] Client disconnected from katakuna!yuki. Removing session.");
    if(socket.token != null && TokenManager.FindUserToken(socket.token) != null) {
      TokenManager.FindUserToken(socket.token).LeaveAllChannels();
      TokenManager.RemoveToken(socket.token);
    }
	});

	socket.on("data", function(data) {
    const dt = data.toString().indexOf("\r\n") >= 0 ? data.toString().split("\r\n") : data.toString().split("\n");
    dt.forEach(d => {
      if(d.length == 0) return; // ignore empty messages

      console.log(`[i] RAW: '${d}'`);
      var command = d.toUpperCase().split(" ")[0].replace(":", "");
      var arguments = d.split(" ");
      arguments = arguments.slice(1, arguments.length);
      console.log(arguments);
      var ch = cmds.filter(c => c.command.toUpperCase() == command);
      if(ch && ch.length > 0) {
        if(arguments.length < (ch[0].min_args ? ch[0].min_args : 0)) socket.write(`:${socket.username} 461 ${socket.username} ${command} :Not enough parameters\r\n`);
        else if((ch[0].required_at_auth ? ch[0].required_at_auth : false) && socket.authenticated) socket.write(`:${socket.username} 462 ${socket.username} :You may not reregister\r\n`);
        else ch[0].call({socket, arguments});
      }
    });
	});
});

server.listen(6743, '0.0.0.0', () => {
  console.log("katakuna!yuki listening on port 6743. IRC is on.");
});
