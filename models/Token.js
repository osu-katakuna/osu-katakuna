const Packets = require('../utils/BanchoUtils/Packets');
const Database = require('../utils/Database/');
const Config = require('../utils/Config');
require('../utils/string');
const ChannelManager = require("../global/global").channels;

class Token {
  constructor(user, token, TokenManager) {
    this.user = user;
    this.token = token;
    this.queue = [];
    this.bot = false;
    this.tournament = false;
    this.joinedChannels = [];
    this.spectators = [];
    this.spectating_user = -1;
    this.removeOnNextQuery = false;
    this.banned = false;
    this.lastEvent = new Date().getTime();
    this.tcpSocket = undefined;

    this.TokenManager = TokenManager;
  }

  resetQueue() {
    this.queue = [];
  }

  enqueue(packet) {
    if(this.tcpSocket == undefined) this.queue.push(packet);
    else {
    	console.log("TCP Socket writing packet!");
    	this.tcpSocket.write(packet);
    }
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
    this.spectators.forEach(x => x.enqueue(data));
  }

  spectateUser(user_id) {
    if(this.spectating_user != -1)
      this.stopSpectating();
    this.spectating_user = user_id;
    this.TokenManager.FindUserID(user_id).addSpectator(this);
  }

  stopSpectating() {
    if(this.spectating_user == -1) return;
    const t = this.TokenManager.FindUserID(this.spectating_user);
    if(t) t.removeSpectator(this);
  }

  removeSpectator(t) {
    this.enqueue(Packets.SpectatorLeft(t.user.user_id));
    this.sendToSpectators(Packets.FellowSpectatorLeft(t.user.user_id));
    this.spectators = this.spectators.filter((s) => s.token != t.token);
  }

  addSpectator(t) {
    if(t == undefined) return;
    this.enqueue(Packets.SpectatorJoined(t.user.user_id));
    this.spectators.forEach((s) => t.enqueue(Packets.FellowSpectatorJoined(s.user.user_id))); // show fellow spectators
    this.sendToSpectators(Packets.FellowSpectatorJoined(t.user.user_id)); // tell other spectators that we have joined
    this.spectators.push(t);
  }

  LeaveAllChannels() {
    this.joinedChannels.forEach((c) => c.RemoveMember(this.user.user_id));
  }

  Kick(closeClient = false, reason = "") {
    this.enqueue(Packets.Notification("You have been kicked from this server."));
    this.enqueue(Packets.LoginFailure());
    if(closeClient) {
      this.enqueue(Packets.ForceExit());
    }
    this.TokenManager.EnqueueAllExcept(this.user.user_id, Packets.UserLogout(this.user));
    this.removeOnNextQuery = true;
  }

  Ban() {
    if(this.banned) return;
    if(!this.banned) {
      this.banned = true;
      this.user.banned = true;
    }
    console.log(`[i] User ${this.user.username} was banned.`);

    var from = {
      "username": "BanchoBot",
      "id": "1"
    };

    if(Config.GetConfig("banned.message").length > 0) {
      this.enqueue(Packets.Notification(Config.GetConfig("banned.message").formatUnicorn({
        servername: Config.GetConfig("server.name"),
        username: this.user.username
      })));
    }

    this.enqueue(Packets.ChatMessage(from, this.user.username, "Your account is currently in restricted mode. For more information, check out [https://katakuna.cc katakuna.cc]."));
    this.TokenManager.EnqueueAllExcept(this.user.user_id, Packets.UserLogout(this.user));
  }

  rtx(message) {
    this.enqueue(Packets.Jumpscare(message));
  }

  OnMemberLeftChannel(ch, user) {
    console.log("noop");
  }

  OnMemberJoinedChannel(ch, user) {
    console.log("noop");
  }
}

module.exports = Token;
