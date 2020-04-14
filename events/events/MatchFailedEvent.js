const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class MatchFailedEvent extends Event {
  constructor() {
    super();
    this.name = "MatchFailedEvent";
    this.type = PacketConstant.client_matchFailed;
  }

  run(args) {
    const { user, data } = args;

    MatchManager.GetUserJoinedMatch(user).FailPlayer(user);
  }
}

module.exports = MatchFailedEvent;
