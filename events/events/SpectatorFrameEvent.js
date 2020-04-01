const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;

class SpectatorFrameEvent extends Event {
  constructor() {
    super();
    this.name = "SpectatorFrameEvent";
    this.type = PacketConstant.client_spectateFrames;
  }

  run(args) {
    const { user, data, token } = args;

    console.log(`[*] User ${user.username} sent a spectator frame!`);
    console.log(`Currently there are ${token.spectators.length} user(s) spectating.`);

    token.sendToSpectators(Packets.SpectatorFrames(data));
  }
}

module.exports = SpectatorFrameEvent;
