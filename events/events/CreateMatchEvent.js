const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class CreateMatchEvent extends Event {
  constructor() {
    super();
    this.name = "CreateMatchEvent";
    this.type = PacketConstant.client_createMatch;
  }

  run(args) {
    const { user, data } = args;

    const match_data = Parsers.MatchInformation(data);

    MatchManager.CreateMatch(user, match_data);
  }
}

module.exports = CreateMatchEvent;
