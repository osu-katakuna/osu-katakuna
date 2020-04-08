const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const MatchManager = require("../../global/global").matches;
var Tokens = require("../../global/global").tokens;

class InviteToMatchEvent extends Event {
  constructor() {
    super();
    this.name = "InviteToMatchEvent";
    this.type = PacketConstant.client_invite;
  }

  run(args) {
    const { user, data } = args;

    const user_id = data.readUInt32LE();

    if(MatchManager.GetUserJoinedMatch(user)) {
      const match = MatchManager.GetUserJoinedMatch(user);
      Tokens.FindUserID(user_id).enqueue(Packets.InviteMessage(user, Tokens.FindUserID(user_id).user.username, `Come and join my multiplayer match: [osump://${match.id}/${match.password == null ? "" : match.password.replace(" ", "_")} ${match.name}]`));
    }
  }
}

module.exports = InviteToMatchEvent;
