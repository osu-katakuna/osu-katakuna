const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;

class CannotSpectateEvent extends Event {
  constructor() {
    super();
    this.name = "CannotSpectateEvent";
    this.type = PacketConstant.client_cantSpectate;
  }

  run(args) {
    const { user, data, token } = args;

    console.log(`[*] User ${user.username} does not have the beatmap!`);

    Tokens.FindUserID(token.spectating_user).sendToSpectators(Packets.SpectatorNoBeatmap(user));
  }
}

module.exports = CannotSpectateEvent;
