const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class ChangeMatchSettingsEvent extends Event {
  constructor() {
    super();
    this.name = "ChangeMatchSettingsEvent";
    this.type = PacketConstant.client_matchChangeSettings;
  }

  run(args) {
    const { user, data } = args;

    const match_data = Parsers.MatchInformation(data);
    MatchManager.UpdateMatch(user, match_data);
  }
}

module.exports = ChangeMatchSettingsEvent;
