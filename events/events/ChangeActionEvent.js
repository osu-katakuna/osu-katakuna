const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Parsers = require('../../utils/BanchoUtils/Parsers');
const Tokens = require("../../global/global").tokens;

class ChangeActionEvent extends Event {
  constructor() {
    super();
    this.name = "ChangeActionEvent";
    this.type = PacketConstant.client_changeAction;
  }

  run(args) {
    const { res, data, user, token } = args;
    const new_status = Parsers.StatusParser(data);

    if(new_status.actionID <= 13) {
      user.gameMode = new_status.gameMode;

      user.setStatus(new_status.actionID, new_status.actionText, new_status.actionMD5, new_status.actionMods);
    }
    
    Tokens.ForceUpdateStats(user.user_id);

    Tokens.EnqueueAll(Packets.UserStats(user));
    Tokens.UpdateUserStatus(user);
  }
}

module.exports = ChangeActionEvent;
