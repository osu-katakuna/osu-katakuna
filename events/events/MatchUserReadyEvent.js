const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class MatchUserReadyEvent extends Event {
  constructor() {
    super();
    this.name = "MatchUserReadyEvent";
    this.type = PacketConstant.client_matchReady;
  }

  run(args) {
    const { user, data } = args;

    if(MatchManager.GetUserJoinedMatch(user) != null)
      MatchManager.GetUserJoinedMatch(user).SetReadyState(user, true);
  }
}

module.exports = MatchUserReadyEvent;
