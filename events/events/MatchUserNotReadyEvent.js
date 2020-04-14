const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class MatchUserNotReadyEvent extends Event {
  constructor() {
    super();
    this.name = "MatchUserNotReadyEvent";
    this.type = PacketConstant.client_matchNotReady;
  }

  run(args) {
    const { user, data } = args;

    MatchManager.GetUserJoinedMatch(user).SetReadyState(user, false);
  }
}

module.exports = MatchUserNotReadyEvent;
