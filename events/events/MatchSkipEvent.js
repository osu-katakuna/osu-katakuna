const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class MatchSkipEvent extends Event {
  constructor() {
    super();
    this.name = "MatchSkipEvent";
    this.type = PacketConstant.client_matchSkipRequest;
  }

  run(args) {
    const { user, data } = args;

    MatchManager.GetUserJoinedMatch(user).SkipRequest(user);
  }
}

module.exports = MatchSkipEvent;
