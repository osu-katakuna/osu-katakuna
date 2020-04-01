const TokenManager = require('../global/TokenManager');
const Packets = require('../utils/BanchoUtils/Packets');

class Channel {
	constructor(name, desc) {
		this.members = [];
		if(name[0] !== '#') {
	    name = '#' + name;
	  }
		this.name = name;
		this.description = desc;
	}

	SendMessage(message, from) {
		this.members.forEach((id) => {
			if(id == from.user_id) return;
			TokenManager.FindUserID(id).SendMessage(from, this.name, message)
		});
	}

	AddMember(user_id) {
		for(var i = 0; i < this.members.length; i++) {
			if(this.members[i] == user_id) return;
		}
		this.members.push(user_id);
		TokenManager.FindUserID(user_id).enqueue(Packets.JoinChatChannel(this.name));
		TokenManager.FindUserID(user_id).joinedChannels.push(this);
		TokenManager.EnqueueAll(Packets.ChannelInfo({name: this.name, description: this.description, members: this.members.length}));
	}

	RemoveMember(user_id) {
		this.members = this.members.filter((u) => u != user_id);
		const curr_user = TokenManager.FindUserID(user_id);
		curr_user.joinedChannels = curr_user.joinedChannels.filter((x) => x.name != this.name);
	}

	KickMember(user_id) {
		this.RemoveMember(user_id);
		TokenManager.FindUserID(user_id).enqueue(Packets.KickedChatChannel(this.name));
	}
}

exports.Channel = Channel
