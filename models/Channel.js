const TokenManager = require('../global/TokenManager');
const Packets = require('../utils/BanchoUtils/Packets');
const Webhook = require('../utils/WebhookChannel');

class Channel {
	constructor(name, desc) {
		this.members = [];
		if(name[0] !== '#') {
	    name = '#' + name;
	  }
		this.name = name;
		this.description = desc;
		this.visibleToNormalPlayers = true;
	}

	SendMessage(message, from) {
		this.members.forEach((id) => {
			if(id == from.user_id) return;
			TokenManager.FindUserID(id).SendMessage(from, this.name, message)
		});
		Webhook.SendMessage(this.name, message, from);
	}

	AddMember(user_id) {
		for(var i = 0; i < this.members.length; i++) {
			if(this.members[i] == user_id) {
				TokenManager.FindUserID(user_id).enqueue(Packets.JoinChatChannel(this.name));
				TokenManager.FindUserID(user_id).joinedChannels.push(this);
				if(this.description !== undefined)
					TokenManager.EnqueueAll(Packets.ChannelInfo({name: this.name, description: this.description, members: this.members.length}));

				const un = TokenManager.FindUserID(user_id).user.username;
				const thisinstance = this;

				this.members.forEach((id) => {
					TokenManager.FindUserID(id).OnMemberJoinedChannel(thisinstance, un);
				});
				return;
			}
		}

		this.members.push(user_id);
		TokenManager.FindUserID(user_id).enqueue(Packets.JoinChatChannel(this.name));
		TokenManager.FindUserID(user_id).joinedChannels.push(this);
		if(this.description !== undefined)
			TokenManager.EnqueueAll(Packets.ChannelInfo({name: this.name, description: this.description, members: this.members.length}));

		const un = TokenManager.FindUserID(user_id).user.username;
		const thisinstance = this;

		this.members.forEach((id) => {
			TokenManager.FindUserID(id).OnMemberJoinedChannel(thisinstance, un);
		});
	}

	RemoveMember(user_id) {
		this.members = this.members.filter((u) => u != user_id);
		const curr_user = TokenManager.FindUserID(user_id);

		const un = TokenManager.FindUserID(user_id).user.username;
		const thisinstance = this;

		this.members.forEach((id) => {
			TokenManager.FindUserID(id).OnMemberLeftChannel(thisinstance, un);
		});

		if(curr_user)
			curr_user.joinedChannels = curr_user.joinedChannels.filter(x => x.name != this.name);
	}

	KickMember(user_id) {
		this.RemoveMember(user_id);
		TokenManager.FindUserID(user_id).enqueue(Packets.KickedChatChannel(this.name));
	}
}

exports.Channel = Channel
