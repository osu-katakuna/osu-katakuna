const Event = require('../../models/Event').Event;
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const PacketParser = require('../../utils/BanchoUtils/Parsers');
const ChannelManager = require("../../global/global").channels;

class JoinChatChannelEvent extends Event {
  constructor() {
    super();
    this.name = "JoinChatChannelEvent";
    this.type = PacketConstant.client_channelJoin;
  }

  run(args) {
    const { user, data, token } = args;

    const channel = PacketParser.ChatChannelParser(data);
    console.log(`[*] User ${user.username} joins the ${channel} chat channel!`);
    ChannelManager.JoinChannel(channel, user);
  }
}

module.exports = JoinChatChannelEvent;
