var cmd_queue = require("../utils/queue");
var protocol = require('../utils/bancho_protocol')
const db = require("../utils/database")

class User {
  constructor() {
    this.username = "";
    this.email = "";
    this.rankedScore = 0;
    this.totalScore = 0;
    this.timezone = 24;
    this.country = 0;
    this.user_id = 0;
    this.longitude = 0;
    this.latitude = 0;
    this.userRank = 4; // supporter
    this.avatar = "";
    this.online = true;
    this.private_messages = [];
    this.token = "";

    this.actionID = 0;
    this.actionText = "";
    this.actionMD5 = "";
    this.actionMods = 0;

    this.spectating_user_id = undefined;
    this.spectators = [];

    this.spectator_data = [];
    this.friends = [];
  }

  get spectating() {
    return this.spectating_user_id != undefined;
  }

  get whoIsSpectating() {
    return this.spectating_user_id;
  }

  spectate(user) {
    this.spectating_user_id = user.user_id;
  }

  stopSpectating() {
    this.spectating_user_id = undefined;
  }

  addFriend(id) {
    db.addFriend(this.user_id, id);
    this.friends.push(id);
    cmd_queue.queueTo(this.token.token_id, protocol.generator.friendList(this.friends));
  }

  removeFriend(id) {
    db.removeFriend(this.user_id, id);
    this.friends = this.friends.filter((uid) => uid != id);
    cmd_queue.queueTo(this.token.token_id, protocol.generator.friendList(this.friends));
  }

  addSpectator(user) {
    if(this.spectators.length < 1) {
      cmd_queue.queueTo(user.token.token_id, protocol.generator.joinChatChannel("#spectator"))
      cmd_queue.queueTo(this.token.token_id, protocol.generator.joinChatChannel("#spectator"))
    }
    this.spectators.push(user);
    console.log("########### ADD SPECTATOR ##############", user);
    cmd_queue.queueTo(this.token.token_id, protocol.generator.addSpectator(user.user_id))
  }

  removeSpectator(user) {
    this.spectators = this.spectators.filter((u) => !(u.user_id == user.user_id));
    cmd_queue.queueTo(user.token.token_id, protocol.generator.kickedChatChannel("#spectator"))
    cmd_queue.queueTo(this.token.token_id, protocol.generator.removeSpectator(user.user_id))
    if(this.spectators.length == 0) {
      cmd_queue.queueTo(this.token.token_id, protocol.generator.kickedChatChannel("#spectator"))
    }
  }

  get pp() {
    return 12345;
  }

  setStatus(id, text, md5, mods) {
    this.actionID = id;
    this.actionText = text;
    this.actionMD5 = md5;
    this.actionMods = mods;
  }

  get status() {
    return {
      "actionID": this.actionID,
      "actionText": this.actionText,
      "actionMD5": this.actionMD5,
      "actionMods": this.actionMods
    };
  }

  get accuracy() {
    return 100 / 100;
  }

  get stats() {
    return {
      user_id:      this.user_id,
      rankedScore:  this.rankedScore,
      accuracy: 		this.accuracy, // acc proc / 100
    	playCount: 	  69,
    	totalScore: 	this.totalScore, // score showed up
    	gameRank: 		this.rank,
    	pp: 			    this.pp,
    	gameMode:     this.gameMode, // OSU!?
      status:       this.status
    };
  }

  get silenceTime() {
    return 0;
  }

  get supporter() {
    return true;
  }

  get GMT() {
    return true;
  }

  get rank() {
    return 1;
  }

  get gameMode() {
    return 0; // osu!
  }
}

module.exports = User;
