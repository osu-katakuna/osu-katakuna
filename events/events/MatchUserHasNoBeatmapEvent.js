const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class MatchUserHasNoBeatmapEvent extends Event {
  constructor() {
    super();
    this.name = "MatchUserHasNoBeatmapEvent";
    this.type = PacketConstant.client_matchNoBeatmap;
  }

  run(args) {
    const { user, data } = args;

    MatchManager.GetUserJoinedMatch(user).HasBeatmap(user, false);
  }
}

module.exports = MatchUserHasNoBeatmapEvent;
