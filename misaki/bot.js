const AvailableCommands = require('./commands').commands;
const MisakiConfig = require('../global/config.json').misaki;
const Database = require('../utils/Database');
const PacketConstant = require('../utils/BanchoUtils/Packets/PacketConstants');
const ChannelManager = require("../global/global").channels;

// TODO: Add permission checks

var BotUserInstance;

function getBotUser() {
  if(!BotUserInstance) {
    BotUserInstance = Database.GetUser(MisakiConfig.userid);
    if(MisakiConfig.customStatus) {
      BotUserInstance.setStatus(PacketConstant.userActions[MisakiConfig.customStatus.status ? MisakiConfig.customStatus.status.toLowerCase() : "idle"], MisakiConfig.customStatus.text ? MisakiConfig.customStatus.text : "", "", 0);
    }
  }
  return BotUserInstance;
}

function CheckIfShowMessage(message) {
  var command = message.message.split(" ")[0].toLowerCase();

  if(command.startsWith(MisakiConfig.prefix ? MisakiConfig.prefix : "!")) {
    command = command.slice(MisakiConfig.prefix ? MisakiConfig.prefix.length : 1);

    if(command == "help") {
      return false;
    }

    var f = AvailableCommands.filter(cmd => (cmd.command == command || (cmd.alias && cmd.alias == command)));
    if(f && f.length > 0) {
      if(f[0].forPrivateUse ? f[0].forPrivateUse : false) {
        return false;
      }
    }
  }

  return true;
}

function ProcessMessage(from, message) {
  var issuer = {
    replyPrivate: (_message) => {
      from.SendMessage(getBotUser(), from.user.username, _message)
    },
    user: from.user,
    token: from,
    channel: {
      send: (_message) => {
        ChannelManager.SendMessage(message.channel, _message, getBotUser());
      },
      sendPrivate: (_message) => {
        from.SendMessage(getBotUser(), message.channel, _message)
      }
    }
  }

  var arguments = message.message.split(" ").slice(1);
  var command = message.message.split(" ")[0].toLowerCase();

  if(command.startsWith(MisakiConfig.prefix ? MisakiConfig.prefix : "!")) {
    command = command.slice(MisakiConfig.prefix ? MisakiConfig.prefix.length : 1);

    if(command == "help") {
      issuer.channel.sendPrivate("Showing all commands for osu!katakuna:");

      if(AvailableCommands.length < 1) {
        issuer.channel.sendPrivate("<no commands>");
      }

      AvailableCommands.forEach((cmd) => {
        issuer.channel.sendPrivate(MisakiConfig.prefix + cmd.command + (cmd.alias ? '(alias: ' + MisakiConfig.prefix + cmd.alias + ')' : "") + ': ' + (cmd.description ? cmd.description : "No description provided."));
      });
    }

    var f = AvailableCommands.filter(cmd => (cmd.command == command || (cmd.alias && cmd.alias == command)));
    if(f && f.length > 0) {
      var cb = f[0].callback.bind(this);
      cb({ issuer, arguments });
    }
  }

  return true;
}

function PrivateMessage(from, message) {
  var issuer = {
    replyPrivate: (_message) => {
      from.SendMessage(getBotUser(), from.user.username, _message)
    },
    user: from.user,
    token: from,
    channel: {
      send: (_message) => {
        from.SendMessage(getBotUser(), from.user.username, _message)
      },
      sendPrivate: (_message) => {
        from.SendMessage(getBotUser(), from.user.username, _message)
      }
    }
  }

  var arguments = message.split(" ").slice(1);
  var command = message.split(" ")[0].toLowerCase();

  if(command.startsWith(MisakiConfig.prefix ? MisakiConfig.prefix : "!")) {
    command = command.slice(MisakiConfig.prefix ? MisakiConfig.prefix.length : 1);

    if(command == "help") {
      issuer.channel.sendPrivate("Showing all commands for osu!katakuna:");

      if(AvailableCommands.length < 1) {
        issuer.channel.sendPrivate("<no commands>");
      }

      AvailableCommands.forEach((cmd) => {
        issuer.channel.sendPrivate(MisakiConfig.prefix + cmd.command + (cmd.alias ? '(alias: ' + MisakiConfig.prefix + cmd.alias + ')' : "") + ': ' + (cmd.description ? cmd.description : "No description provided."));
      });
    }

    var f = AvailableCommands.filter(cmd => (cmd.command == command || (cmd.alias && cmd.alias == command)));
    if(f && f.length > 0) {
      var cb = f[0].callback.bind(this);
      cb({ issuer, arguments });
    } else {
      from.SendMessage(getBotUser(), from.user.username, "Beep, boop! I don't know this command!");
    }
  } else {
    from.SendMessage(getBotUser(), from.user.username, "Hey there! You seem to have trouble typing commands. Send me !help anywhere, and I will be happy to help you.");
  }
}

module.exports = {
  ProcessMessage,
  getBotUser,
  PrivateMessage,
  CheckIfShowMessage
};
