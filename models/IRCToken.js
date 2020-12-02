const Packets = require('../utils/BanchoUtils/Packets');
const Database = require('../utils/Database/');
const Config = require('../utils/Config');
require('../utils/string');
const ChannelManager = require("../global/global").channels;
const Token = require("./Token");

class IRCToken extends Token {
  constructor(user, token, TokenManager, socket) {
    super(user, token, TokenManager);
    this.tournament = true;
    this.socket = socket;
  }

  SendMessage(from, to, msg) {
    var m = msg.split("\n");
    m.forEach(msg => this.socket.write(`:${from.username}!${this.socket.__hostname} PRIVMSG ${to} :${msg}\r\n`));
  }

  OnMemberLeftChannel(ch, user) {
    this.socket.write(`:${user}!${this.socket.__hostname} PART ${ch.name}\r\n`);
  }

  OnMemberJoinedChannel(ch, user) {
    this.socket.write(`:${user}!${this.socket.__hostname} JOIN ${ch.name}\r\n`);
  }

  Kick(closeClient = false, reason = "no reason provided") {
    this.socket.write(`:${this.socket.__hostname} NOTICE * :You have been kicked from this server for the following reason: ${reason}\r\n`);
    this.socket.destroy();
    this.removeOnNextQuery = true;
  }
}

module.exports = IRCToken;
