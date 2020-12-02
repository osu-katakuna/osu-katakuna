const ChannelManager = require('../global/ChannelManager');
const TokenManager = require("../global/global").tokens;
const MatchManager = require("../global/global").matches;
const Database = require('../utils/Database/');
const Packets = require('../utils/BanchoUtils/Packets');
const os = require('os');


const commands = [
  {
    command: "announce",
    description: "Broadcasts a message on the entire server.",
    forPrivateUse: true,
    callback: function ({ issuer, arguments }) {
      var announceChannel = ChannelManager.GetChannel("#announce");
      if(!announceChannel) {
        issuer.channel.sendPrivate("#announce was not found!");
        return;
      }

      announceChannel.SendMessage(arguments.join(" "), this.getBotUser());
      issuer.channel.sendPrivate("An announcement was published on #announce!");
    },
    permissionsRequired: [
      "admin.announce"
    ]
  },
  {
    command: "rtx",
    description: "Broadcasts a message to an user and 'scares' them.",
    forPrivateUse: true,
    callback: function ({ issuer, arguments }) {
      if(arguments.length < 2) {
        issuer.channel.sendPrivate("Syntax: <user/user id> <message>.");
        return;
      }

      if(!TokenManager.FindUsernameToken(arguments[0])) {
        issuer.channel.sendPrivate("Invalid user or internal error. Most probably invalid user.");
        return;
      }

      TokenManager.FindUsernameToken(arguments[0]).rtx(arguments.slice(1).join(" "));

      issuer.channel.sendPrivate("Did it. He should be scared in any moment from now.");
    },
    permissionsRequired: [
      "admin.rtx"
    ]
  },
  {
    command: "roll",
    description: "Roll a number.",
    callback: function ({ issuer, arguments }) {
      issuer.channel.send(issuer.user.username + " rolled an " + (Math.floor(Math.random() * (arguments.length >= 1 ? parseInt(arguments[0]) : 100))) + '.')
    }
  },
  {
    command: "relax",
    alias: "rx",
    forPrivateUse: true,
    description: "Toggle between relax mode.",
    callback: function ({ issuer, arguments }) {
      TokenManager.FindUserID(issuer.user.user_id).user.toggleRelax();
      issuer.channel.sendPrivate("You switched to " + (TokenManager.FindUserID(issuer.user.user_id).user.relax ? "relax" : "vanilla") + " mode.");
      TokenManager.ForceUpdateStats(issuer.user.user_id);

      TokenManager.EnqueueAll(Packets.UserStats(issuer.user));
      TokenManager.UpdateUserStatus(issuer.user);
    }
  },
  {
    command: "depression",
    description: "Useful command for depression.",
    callback: function ({ issuer, arguments }) {
      issuer.channel.sendPrivate(`Hey, ${issuer.user.username}! Listen here! Life is beautiful. You should not be depressed over something. It happens to everyone. The most important thing is that you have trust in yourself. And don't forget what Aoba Suzukaze said: 'Fuck stove, here's washing machine.'`)
    }
  },
  {
    command: "server",
    description: "Prints server stats",
    callback: function ({ issuer, arguments }) {
      const load = os.loadavg();
      const msg = `osu!katakuna server
katakuna!kodachi score server
made by talnacialex

[SERVER STATS]
Total created tokens: ${TokenManager.OnlineUsersTokens().length}
Multiplayer Matches: ${MatchManager.GetAllMatches().length}

[SYSTEM STATS]
Running on ${os.type()}(${os.arch()}) ${os.release()}
CPU: ${os.cpus().length} core(s)(${os.cpus()[0].model})
RAM: ${Math.round(os.totalmem() / 1000000000)}GB total, ${Math.round(os.freemem() / 1000000000)}GB free
Load: ${load[0].toFixed(2)}/${load[1].toFixed(2)}/${load[2].toFixed(2)}`;
      issuer.channel.send(msg);
    }
  },
  {
    command: "kick",
    description: "Kick users, and can close the client. Parameters: <username> [close client]",
    forPrivateUse: true,
    callback: function ({ issuer, arguments }) {
      var user_to_kick = (arguments.length > 1 && arguments[arguments.length - 1].toLowerCase() == "client" && arguments[arguments.length - 2].toLowerCase() == "close") ? arguments.slice(0, arguments.length - 2).join(" ") : arguments.join(" ");
      var u = TokenManager.FindUsernameToken(user_to_kick);
      if(!u) {
        if(Database.GetUser(user_to_kick)) {
          issuer.channel.sendPrivate(`'${user_to_kick}' is currently offline. I can't kick him...`);
        } else {
          issuer.channel.sendPrivate(`I don't know who is '${user_to_kick}'.`);
          if(arguments.length > 1 && arguments[arguments.length - 1].toLowerCase() == "close") {
            issuer.channel.sendPrivate("Note: If you want to make his client exit by itself, just add client to the end of this command, so it becomes something like kick " + user_to_kick + " client");
          }
        }
        return;
      }
      issuer.channel.sendPrivate(`Kicked '${user_to_kick}' from the server.`);
      u.Kick((arguments[arguments.length - 1].toLowerCase() == "client" && arguments[arguments.length - 2].toLowerCase() == "close"));
    },
    permissionsRequired: [
      "admin.users.manage.kick"
    ]
  },
  {
    command: "shiori",
    description: "Switch to the katakuna!shiori development server. It's under construction so yeah.",
    forPrivateUse: true,
    callback: function ({ issuer, arguments }) {
      issuer.channel.sendPrivate("You will be switched to the shiori! private server now. Restart to come back to katakuna.");
      TokenManager.FindUserID(issuer.user.user_id).enqueue(Packets.SwitchTournamentServer("c.katakuna.tk"));
    },
    permissionsRequired: [
      "admin.announce"
    ]
  }
];

module.exports = {
  commands
};
