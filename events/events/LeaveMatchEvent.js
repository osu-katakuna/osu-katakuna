const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const MatchJoinData = require('../../utils/BanchoUtils/Parsers').MatchJoinData;
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;
const ChannelManager = require("../../global/global").channels;
const MatchManager = require("../../global/global").matches;

class LeaveMatchEvent extends Event {
  constructor() {
    super();
    this.name = "LeaveMatchEvent";
    this.type = PacketConstant.client_partMatch;
  }

  run(args) {
    const { user, data, token } = args;

    console.log(`[i] User ${user.username} is leaving the match.`);
    MatchManager.LeaveMatch(user);
  }
}

module.exports = LeaveMatchEvent;
