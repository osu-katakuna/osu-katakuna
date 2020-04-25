const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class MatchMoveUserSlotEvent extends Event {
  constructor() {
    super();
    this.name = "MatchMoveUserSlotEvent";
    this.type = PacketConstant.client_matchChangeSlot;
  }

  run(args) {
    const { user, data } = args;

    MatchManager.GetUserJoinedMatch(user).MoveUserToSlot(user, data.readUInt32LE());
  }
}

module.exports = MatchMoveUserSlotEvent;
