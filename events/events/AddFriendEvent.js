const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const PacketConstant = require('../../utils/BanchoUtils/Packets/PacketConstants');
const Tokens = require("../../global/global").tokens;
const Parsers = require('../../utils/BanchoUtils/Parsers');

class AddFriendEvent extends Event {
  constructor() {
    super();
    this.name = "AddFriendEvent";
    this.type = PacketConstant.client_friendAdd;
  }

  run(args) {
    const { user, data, token } = args;

    const new_friend = Parsers.UserParser(data);
    const _friend = Tokens.FindUserID(new_friend);
    console.log(`[*] ${user.username} added ${_friend.user.username} as a friend.`);

    token.AddFriend(_friend.user);
  }
}

module.exports = AddFriendEvent;
