const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;

class LogoffEvent extends Event {
  constructor() {
    super();
    this.name = "LogoffEvent";
    this.type = PacketConstant.client_logout;
  }

  run(args) {
    const { res, user, token } = args;

    token.LeaveAllChannels();
    Tokens.RemoveToken(token.token);
    Tokens.EnqueueAll(Packets.UserLogout(user));
  }
}

module.exports = LogoffEvent;
