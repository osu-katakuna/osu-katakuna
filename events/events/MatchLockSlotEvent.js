const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class MatchLockSlotEvent extends Event {
  constructor() {
    super();
    this.name = "MatchLockSlotEvent";
    this.type = PacketConstant.client_matchLock;
  }

  run(args) {
    const { user, data } = args;

    MatchManager.GetUserJoinedMatch(user).ToggleSlotLockState(data.readUInt32LE());
  }
}

module.exports = MatchLockSlotEvent;
