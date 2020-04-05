const Event = require('../../models/Event').Event;
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const PacketParser = require('../../utils/BanchoUtils/Parsers');
const ChannelManager = require("../../global/global").channels;
const MatchManager = require("../../global/global").matches;

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

    if(channel === "#spectator" && token.spectating_user == -1)
      ChannelManager.KickUser("#spectator", user);
    else if(channel === "#lobby" && !MatchManager.PlayerInLobby(user))
      ChannelManager.KickUser("#lobby", user);
    else
      ChannelManager.JoinChannel(channel, user);
  }
}

module.exports = JoinChatChannelEvent;
