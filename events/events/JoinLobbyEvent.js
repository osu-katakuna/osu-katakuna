const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
var Tokens = require("../../global/global").tokens;
var ChannelManager = require("../../global/global").channels;
var MatchManager = require("../../global/global").matches;

class JoinLobbyEvent extends Event {
  constructor() {
    super();
    this.name = "JoinLobbyEvent";
    this.type = PacketConstant.client_joinLobby;
  }

  run(args) {
    const { user, data, token } = args;

    console.log(`[i] User ${user.username} joined the Multiplayer lobby!`);

    ChannelManager.JoinChannel("#lobby", user);
    MatchManager.JoinLobby(user);

    MatchManager.GetAllMatches().forEach(m => {
      token.enqueue(Packets.NewMatchInfo(m));
      console.log(m);
    });
  }
}

module.exports = JoinLobbyEvent;
