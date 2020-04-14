const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class MatchUserChangesModsEvent extends Event {
  constructor() {
    super();
    this.name = "MatchUserChangesModsEvent";
    this.type = PacketConstant.client_matchChangeTeam;
  }

  run(args) {
    const { user, data } = args;

    MatchManager.GetUserJoinedMatch(user).ToggleTeams(user);
  }
}

module.exports = MatchUserChangesModsEvent;
