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

    if(_friend == null) {
      console.log(`[*] ${user.username} tried to add an inexistend user(ID: ${new_friend}) as a friend.`);
      token.enqueue(Packets.Notification(`I'm sorry, but you tried to add an inexistent user(ID: ${new_friend}) as an friend.`));
      return;
    }

    console.log(`[*] ${user.username} added ${_friend.user.username} as a friend.`);

    token.AddFriend(_friend.user);
  }
}

module.exports = AddFriendEvent;
