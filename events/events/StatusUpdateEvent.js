const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Parsers = require('../../utils/BanchoUtils/Parsers');
const Tokens = require("../../global/global").tokens;

class StatusUpdateEvent extends Event {
  constructor() {
    super();
    this.name = "StatusUpdateEvent";
    this.type = PacketConstant.client_requestStatusUpdate;
  }

  run(args) {
    const { res, user, token } = args;

    Tokens.OnlineUsers().forEach((user) => Packets.UserStats(user));
  }
}

module.exports = StatusUpdateEvent;
