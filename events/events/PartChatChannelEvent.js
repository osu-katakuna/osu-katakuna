const Event = require('../../models/Event').Event;
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const PacketParser = require('../../utils/BanchoUtils/Parsers');
const ChannelManager = require("../../global/global").channels;
const Tokens = require("../../global/global").tokens;

class PartChatChannelEvent extends Event {
  constructor() {
    super();
    this.name = "PartChatChannelEvent";
    this.type = PacketConstant.client_channelPart;
  }

  run(args) {
    const { user, data, token } = args;

    const channel = PacketParser.ChatChannelParser(data);
    console.log(`[*] User ${user.username} left the ${channel} chat channel!`);
    if(Tokens.GetJoinedChannel(channel, user)) ChannelManager.LeaveChannel(channel, user);
  }
}

module.exports = PartChatChannelEvent;
