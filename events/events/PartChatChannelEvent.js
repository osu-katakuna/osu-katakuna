const Event = require('../../models/Event').Event;
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const PacketParser = require('../../utils/BanchoUtils/Parsers');
const ChannelManager = require("../../global/global").channels;

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
    ChannelManager.GetChannel(channel).RemoveMember(user.user_id);
  }
}

module.exports = PartChatChannelEvent;
