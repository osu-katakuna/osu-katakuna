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
    this.banned = false;

    this.actionID = 0;
    this.actionText = "";
    this.actionMD5 = "";
    this.actionMods = 0;

    this.friends = [];
    this.database = null;

    this.gameMode = 0;

    this.cachedStats = [];
    for(var i = 0; i < 5; i++) {
      this.cachedStats.push({
        plays: 0,
        totalScore: 0,
        rank: 0,
        accuracy: 0,
        pp: 0
      });
    }
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

  get plays() {
    return this.cachedStats[this.gameMode].plays;
  }

  get totalScore() {
    return this.cachedStats[this.gameMode].totalScore;
  }

  get rank() {
    return this.cachedStats[this.gameMode].rank;
  }

  get accuracy() {
    return this.cachedStats[this.gameMode].accuracy / 100;
  }

  get pp() {
    return this.cachedStats[this.gameMode].pp;
  }

  get silenceTime() {
    return 0;
  }

  get supporter() {
    return !this.banned;
  }

  get GMT() {
    return false;
  }
}

module.exports = User;
