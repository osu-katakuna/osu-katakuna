const Packets = require('../utils/BanchoUtils/Packets');
const Database = require('../utils/Database/');
const ChannelManager = require("../global/global").channels;

class Token {
  constructor(user, token, TokenManager) {
    this.user = user;
    this.token = token;
    this.queue = [];
    this.bot = false;
    this.joinedChannels = [];
    this.spectators = [];
    this.spectating_user = -1;
    this.removeOnNextQuery = false;
    this.banned = false;
    this.lastEvent = new Date().getTime();

    this.TokenManager = TokenManager;
  }

  resetQueue() {
    this.queue = [];
  }

  enqueue(packet) {
    this.queue.push(packet);
  }

  SendMessage(from, to, msg) {
    this.enqueue(Packets.ChatMessage(from, to, msg));
  }

  AddFriend(friend) {
    if(this.user.friends.filter(x => x == friend.user_id).length > 0) {
      console.log(`[i] Cannot add ${friend.username} as a Friend; he is already a Friend...`);
      return;
    }
    this.user.friends.push(friend.user_id);
    Database.AddFriendForUser(this.user, friend);
    console.log(`[*] Added successfully ${friend.username} as a friend for ${this.user.username}!`);
  }

  RemoveFriend(friend) {
    if(this.user.friends.filter(x => x == friend.user_id).length < 0) {
      console.log(`[i] Cannot remove ${friend.username} from user's list; he is NOT a Friend...`);
      return;
    }
    this.user.friends = this.user.friends.filter(x => x != friend.user_id);
    Database.RemoveFriendForUser(this.user, friend);
  }

  sendToSpectators(data) {
    this.TokenManager.EnqueueToMultiple(this.spectators, data);
  }

  spectateUser(user_id) {
    if(this.spectating_user != -1)
      this.stopSpectating();
    this.spectating_user = user_id;
    this.TokenManager.FindUserID(user_id).addSpectator(this.user.user_id);
  }

  stopSpectating() {
    if(this.spectating_user == -1) return;
    const t = this.TokenManager.FindUserID(this.spectating_user);
    if(t)
      t.removeSpectator(this.user.user_id);
  }

  removeSpectator(user_id) {
    this.TokenManager.FindUserID(this.user.user_id).enqueue(Packets.SpectatorLeft(user_id));
    this.sendToSpectators(Packets.FellowSpectatorLeft(user_id));
    this.spectators = this.spectators.filter((s) => s != user_id);
  }

  addSpectator(user_id) {
    this.TokenManager.FindUserID(this.user.user_id).enqueue(Packets.SpectatorJoined(user_id));
    this.spectators.forEach((s) => this.TokenManager.FindUserID(user_id).enqueue(Packets.FellowSpectatorJoined(s))); // show fellow spectators
    this.sendToSpectators(Packets.FellowSpectatorJoined(user_id)); // tell other spectators that we have joined
    this.spectators.push(user_id);
  }

  LeaveAllChannels() {
    this.joinedChannels.forEach((c) => c.RemoveMember(this.user.user_id));
  }

  Ban() {
    if(this.banned) return;
    if(!this.banned) this.banned = true;
    console.log(`[i] User ${this.user.username} was banned.`);
    this.enqueue(Packets.Notification(`You are banned on osu!katakuna! Please appeal in our forums at katakuna.cc`));
    this.enqueue(Packets.LoginBanned());
    this.TokenManager.EnqueueAllExcept(this.user.user_id, Packets.UserLogout(this.user));
    this.removeOnNextQuery = true;
  }
}

module.exports = Token;
