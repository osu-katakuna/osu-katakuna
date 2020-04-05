const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const MatchJoinData = require('../../utils/BanchoUtils/Parsers').MatchJoinData;
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;
const ChannelManager = require("../../global/global").channels;
const MatchManager = require("../../global/global").matches;

class JoinMatchEvent extends Event {
  constructor() {
    super();
    this.name = "JoinMatchEvent";
    this.type = PacketConstant.client_joinMatch;
  }

  run(args) {
    const { user, data, token } = args;

    const match = MatchJoinData(data);
    console.log(`[i] User ${user.username} is joining match #${match.id} !`);
    MatchManager.JoinMatch(user, match.id, match.password);
  }
}

module.exports = JoinMatchEvent;
