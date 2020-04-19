class User {
  constructor() {
    this.username = "";
    this.email = "";
    this.rankedScore = 0;
    this.timezone = 24;
    this.country = 0;
    this.user_id = 0;
    this.longitude = 0;
    this.latitude = 0;
    this.userRank = 4; // supporter
    this.avatar = "";
    this.token = "";

    this.actionID = 0;
    this.actionText = "";
    this.actionMD5 = "";
    this.actionMods = 0;

    this.friends = [];
    this.database = null;
    this.totalScore = 0;
    this.plays = 0;
    this.rank = 0;
    this.accuracy = 0;
    this.gameMode = 0;
  }

  get pp() {
    return 0;
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

  get stats() {
    return {
      user_id:      this.user_id,
      rankedScore:  this.totalScore,
      accuracy: 		this.accuracy, // acc proc / 100
    	playCount: 	  this.plays,
    	totalScore: 	this.totalScore, // score showed up
    	gameRank: 		this.rank,
    	pp: 			    this.pp,
    	gameMode:     this.gameMode, // OSU!?
      status:       this.status
    };
  }

  updateStats() {
    this.plays = this.database.GetPlaysForUserID(this.user_id, this.gameMode);
    this.totalScore = this.database.GetScoreForUserID(this.user_id, this.gameMode);
    this.rank = this.database.GetRankPositionForUserID(this.user_id, this.gameMode);
    this.accuracy = this.database.GetAccuracyForUserID(this.user_id, this.gameMode) / 100;
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
}

module.exports = User;
