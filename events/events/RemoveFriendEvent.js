const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class RemoveFriendEvent extends Event {
  constructor() {
    super();
    this.name = "RemoveFriendEvent";
    this.type = PacketConstant.client_friendRemove;
  }

  run(args) {
    const { user, data, token } = args;

    const friend = Parsers.UserParser(data);
    const _friend = Tokens.FindUserID(friend);
    console.log(`[*] ${user.username} removed ${_friend.user.username} from their friend list.`);

    token.RemoveFriend(_friend.user);
  }
}

module.exports = RemoveFriendEvent;
