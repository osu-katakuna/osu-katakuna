const Event = require('../../models/Event').Event;
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const PacketParser = require('../../utils/BanchoUtils/Parsers');
const Database = require('../../utils/Database/');
const Tokens = require("../../global/global").tokens;

class PrivateMessageEvent extends Event {
  constructor() {
    super();
    this.name = "PrivateMessageEvent";
    this.type = PacketConstant.client_sendPrivateMessage;
  }

  run(args) {
    const { user, data } = args;

    const message = PacketParser.ChatMessageParser(data);
    console.log(`[*] User ${user.username} sent a private message to ${message.channel}(${message.message})!`);
    Database.SaveMessage(user, message.message, Tokens.FindUsernameToken(message.channel).user);
  }
}

module.exports = PrivateMessageEvent;
