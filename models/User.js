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
    this.showStats = true;
    this.relax = false;

    this.actionID = 0;
    this.actionText = "";
    this.actionMD5 = "";
    this.actionMods = 0;

    this.friends = [];
    this.database = null;

    this.gameMode = 0;

    this.cachedStats = [];
    for(var i = 0; i < 8; i++) {
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
    this.relax = (mods & (1 << 7)) > 1;
  }

  toggleRelax() {
    this.relax = !this.relax;
  }

  get status() {
    return {
      "actionID": this.actionID,
      "actionText": this.relax ? (this.actionText ? this.actionText + " on Relax" : "on Relax") : this.actionText,
      "actionMD5": this.actionMD5,
      "actionMods": this.relax ? (this.actionMods & (1 << 7)) : this.actionMods
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
    return this.cachedStats[(this.relax ? 4 : 0) + this.gameMode].plays;
  }

  get totalScore() {
    return this.cachedStats[(this.relax ? 4 : 0) + this.gameMode].totalScore;
  }

  get rank() {
    return this.cachedStats[(this.relax ? 4 : 0) + this.gameMode].rank;
  }

  get accuracy() {
    return this.cachedStats[(this.relax ? 4 : 0) + this.gameMode].accuracy / 100;
  }

  get pp() {
    return this.cachedStats[(this.relax ? 4 : 0) + this.gameMode].pp;
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
