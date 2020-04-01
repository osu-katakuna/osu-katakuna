const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;

class PingEvent extends Event {
  constructor() {
    super();
    this.name = "PingEvent";
    this.type = PacketConstant.client_pong;
  }

  run(args) {
    const { res, user } = args;

    console.log(`[*] User ${user.username} pinged to server!`);
  }
}

module.exports = PingEvent;
