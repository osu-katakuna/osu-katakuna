const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;
const ChannelManager = require("../../global/global").channels;
const MatchManager = require("../../global/global").matches;

class PartLobbyEvent extends Event {
  constructor() {
    super();
    this.name = "PartLobbyEvent";
    this.type = PacketConstant.client_partLobby;
  }

  run(args) {
    const { user, data, token } = args;

    console.log(`[i] User ${user.username} left the Multiplayer lobby.`);

    ChannelManager.KickUser("#lobby", user);
    MatchManager.LeaveLobby(user);
  }
}

module.exports = PartLobbyEvent;
