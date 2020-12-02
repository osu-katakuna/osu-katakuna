const Event = require('../../models/Event').Event;
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const PacketParser = require('../../utils/BanchoUtils/Parsers');
const Database = require('../../utils/Database/');
const Tokens = require("../../global/global").tokens;
const Config = require('../../global/config.json');
const Misaki = require('../../misaki/bot');

class PrivateMessageEvent extends Event {
  constructor() {
    super();
    this.name = "PrivateMessageEvent";
    this.type = PacketConstant.client_sendPrivateMessage;
  }

  run(args) {
    const { user, data, token } = args;

    const message = PacketParser.ChatMessageParser(data);
    console.log(`[*] User ${user.username} sent a private message to ${message.channel}(${message.message})!`);

    if((Config.misaki && Config.misaki.enabled) && Misaki.getBotUser().username == message.channel) {
      Misaki.PrivateMessage(token, message.message);
      return;
    }

    var target_user = Tokens.FindUsernameToken(message.channel);
    if(!target_user) {
      console.log(`[i] The targeted user is offline. Sending message to DB.`);
      target_user = Database.GetUser(message.channel);
    } else {
      target_user = target_user.user;
    }

    Database.SaveMessage(user, message.message, target_user);
  }
}

module.exports = PrivateMessageEvent;
