
class Channel {
	constructor(name, desc) {
		this.members = [];
		this.name = name;
		this.description = desc;
		this.conditionToJoin = () => {
			return true;
		}
	}

	add_member(user) {
		if(!this.conditionToJoin(user)) return false

		this.members.push({
			"member": user,
			"messages": []
		});

		return true;
	}

	remove_member(user) {
		this.members = this.members.filter((u) => !(u.id == user));
		return true;
	}
}

exports.Channel = Channel
