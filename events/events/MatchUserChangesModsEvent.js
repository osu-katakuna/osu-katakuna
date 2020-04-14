const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class MatchUserChangesModsEvent extends Event {
  constructor() {
    super();
    this.name = "MatchUserChangesTeamEvent";
    this.type = PacketConstant.client_matchChangeMods;
  }

  run(args) {
    const { user, data } = args;

    MatchManager.GetUserJoinedMatch(user).SetMods(user, data.readUInt32LE());
  }
}

module.exports = MatchUserChangesModsEvent;
