const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class StopSpectatingEvent extends Event {
  constructor() {
    super();
    this.name = StopSpectatingEvent;
    this.type = PacketConstant.client_stopSpectating;
  }

  run(args) {
    const { user, data, token } = args;
    console.log(`[*] User ${user.username} stopped spectating.`);
    token.stopSpectating();
  }
}

module.exports = StopSpectatingEvent;
