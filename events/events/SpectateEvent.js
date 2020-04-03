const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;
const Parsers = require('../../utils/BanchoUtils/Parsers');
const ChannelManager = require("../../global/global").channels;

class SpectateEvent extends Event {
  constructor() {
    super();
    this.name = "SpectateEvent";
    this.type = PacketConstant.client_startSpectating;
  }

  run(args) {
    const { user, data, token } = args;

    const spectated_user = Parsers.SpectateParser(data);
    const spectator = Tokens.FindUserID(spectated_user);
    console.log(`[*] User ${user.username} started spectating ${spectator.user.username}.`);

    token.spectateUser(spectated_user);
    if(Tokens.GetJoinedChannel("#spectator", user)) ChannelManager.KickUser("#spectator", user);
    if(!Tokens.GetJoinedChannel("#spectator", spectator.user)) ChannelManager.JoinChannel("#spectator", spectator.user);
    ChannelManager.JoinChannel("#spectator", user);
  }
}

module.exports = SpectateEvent;
