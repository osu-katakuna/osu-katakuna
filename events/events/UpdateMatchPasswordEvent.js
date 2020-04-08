const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class UpdateMatchPasswordEvent extends Event {
  constructor() {
    super();
    this.name = "UpdateMatchPasswordEvent";
    this.type = PacketConstant.client_matchChangePassword;
  }

  run(args) {
    const { user, data } = args;

    const match_data = Parsers.MatchInformation(data);

    if(MatchManager.GetUserJoinedMatch(user)) {
      MatchManager.GetUserJoinedMatch(user).UpdatePassword(match_data.password);
    }
  }
}

module.exports = UpdateMatchPasswordEvent;
