const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class MatchUserScoreEvent extends Event {
  constructor() {
    super();
    this.name = "MatchUserScoreEvent";
    this.type = PacketConstant.client_matchScoreUpdate;
  }

  run(args) {
    const { user, data } = args;

    console.log(`[*] User ${user.username} sent a match score frame!`);
    const score = Parsers.ScoreFrame(data);

    MatchManager.GetUserJoinedMatch(user).UpdateScore(user, score);
  }
}

module.exports = MatchUserScoreEvent;
