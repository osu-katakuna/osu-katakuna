const Event = require('../../models/Event').Event;
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const PacketParser = require('../../utils/BanchoUtils/Parsers');
const ChannelManager = require("../../global/global").channels;
const Config = require('../../global/config.json');
const Misaki = require('../../misaki/bot');

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
    if((Config.misaki && Config.misaki.enabled) && message.message.startsWith(Config.misaki.prefix ? Config.misaki.prefix : '!')) {
      if(Misaki.CheckIfShowMessage(message)) {
        ChannelManager.SendMessage(message.channel, message.message, user);
      }

      if(message.message.startsWith("\x01ACTION")) {
        message.message = "*" + user.username + message.message.slice(7);
      }

      if(message.message[message.message.length - 1] == "\x01") {
        message.message = message.message.substr(0, message.message.length - 1);
      }

      Misaki.ProcessMessage(token, message)
    } else {
      ChannelManager.SendMessage(message.channel, message.message, user);
    }
  }
}

module.exports = PublicMessageEvent;
