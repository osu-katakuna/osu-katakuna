const Event = require('../../models/Event').Event;
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const PacketParser = require('../../utils/BanchoUtils/Parsers');
const ChannelManager = require("../../global/global").channels;

class PublicMessageEvent extends Event {
  constructor() {
    super();
    this.name = "PublicMessageEvent";
    this.type = PacketConstant.client_sendPublicMessage;
  }

  run(args) {
    const { user, data, token } = args;

    const message = PacketParser.ChatMessageParser(data);
    console.log(`[*] User ${user.username} sent a message on ${message.channel}(${message.message})!`);
    ChannelManager.SendMessage(message.channel, message.message, user);
  }
}

module.exports = PublicMessageEvent;
