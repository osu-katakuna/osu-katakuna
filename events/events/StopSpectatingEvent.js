const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;
const Parsers = require('../../utils/BanchoUtils/Parsers');
const ChannelManager = require("../../global/global").channels;

class StopSpectatingEvent extends Event {
  constructor() {
    super();
    this.name = "StopSpectatingEvent";
    this.type = PacketConstant.client_stopSpectating;
  }

  run(args) {
    const { user, data, token } = args;

    console.log(`[*] User ${user.username} stopped spectating.`);
    token.stopSpectating();
    if(Tokens.GetJoinedChannel("#spectator", user))
      ChannelManager.KickUser("#spectator", user);

    if(token.spectating_user != -1) {
      const spectator = Tokens.FindUserID(token.spectating_user);
      if(spectator.spectators.length == 0)
        ChannelManager.KickUser("#spectator", spectator.user);
    }
  }
}

module.exports = StopSpectatingEvent;
