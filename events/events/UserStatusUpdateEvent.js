const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;

class UserStatusUpdateEvent extends Event {
  constructor() {
    super();
    this.name = "UserStatusUpdateEvent";
    this.type = PacketConstant.client_userStatsRequest;
  }

  run(args) {
    const { res } = args;

    Tokens.OnlineUsers().forEach(user => res.write(Packets.UserStats(user)));
  }
}

module.exports = UserStatusUpdateEvent;
