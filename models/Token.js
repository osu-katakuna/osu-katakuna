const Packets = require('../utils/BanchoUtils/Packets');

class Token {
  constructor(user, token, TokenManager) {
    this.user = user;
    this.token = token;
    this.queue = [];
    this.joinedChannels = [];
    this.spectators = [];
    this.spectating_user = -1;

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
    this.TokenManager.FindUserID(this.spectating_user).removeSpectator(this.user.user_id);
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
}

module.exports = Token;
