const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
var Tokens = require("../../global/global").tokens;
var ChannelManager = require("../../global/global").channels;
var MatchManager = require("../../global/global").matches;

class SetMatchHostEvent extends Event {
  constructor() {
    super();
    this.name = "SetMatchHostEvent";
    this.type = PacketConstant.client_matchTransferHost;
  }

  run(args) {
    const { user, data, token } = args;

    const slot = data.readUInt32LE();

    if(MatchManager.GetUserJoinedMatch(user)) {
      console.log(`[i] User ${user.username} is transfering host privileges to slot #${slot} on ${MatchManager.GetUserJoinedMatch(user).id}!`);
      MatchManager.GetUserJoinedMatch(user).SetHost(Tokens.FindUserID(MatchManager.GetUserJoinedMatch(user).GetSlot(slot).userID).user);
    }
  }
}

module.exports = SetMatchHostEvent;
