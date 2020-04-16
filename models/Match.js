const TokenManager = require('../global/TokenManager');
const Packets = require('../utils/BanchoUtils/Packets');
const GameModes = require('../utils/BanchoUtils/Packets/Constants/Gamemodes');
const MatchScoringTypes = require('../utils/BanchoUtils/Packets/Constants/MatchScoringTypes');
const MatchTeamTypes = require('../utils/BanchoUtils/Packets/Constants/MatchTeamTypes');
const MatchModModes = require('../utils/BanchoUtils/Packets/Constants/MatchModModes');
const SlotStatus = require('../utils/BanchoUtils/Packets/Constants/SlotStatus');
const PlayersInLobby = require('../global/GlobalLobbyPlayers').PlayersInLobby;

class Match {
  constructor() {
    this.id = -1;
    this.deleted = false;
    this.inProgress = false;
    this.mods = 0;
    this.name = "";
    this.password = null;
    this.beatmapName = "";
	  this.beatmapID = 0;
	  this.beatmapMD5 = "";
    this.slots = [];
    this.hostUserID = 0;
	  this.gameMode = GameModes.Standard;
	  this.matchScoringType = MatchScoringTypes.Score;
	  this.matchTeamType = MatchTeamTypes.HeadToHead;
   	this.matchModMode = MatchModModes.Normal;
    this.seed = 0;

    for(var s = 0; s < 16; s++) {
      this.slots.push({
        status: SlotStatus.Free,
        team: 0,
        userID: -1,
        mods: 0,
        loaded: false,
        skip: false,
        complete: false
      });
    }
  }

  JoinUser(user) {
    for(var s = 0; s < 16; s++) {
      if(this.slots[s].status == SlotStatus.Free) {
        const slot = this.GetSlot(s);
        slot.status = SlotStatus.NotReady;
        slot.userID = user.user_id;
        slot.mods = 0;
        slot.team = 0;
        slot.loaded = false;
        slot.skip = false;
        slot.complete = false;
        this.SetSlot(s, slot);

        console.log(`[i] [MP-${this.id}] ${user.username} joined the room.`);
        const u = TokenManager.FindUserID(user.user_id);
        u.enqueue(Packets.MatchJoinSuccess(this));
        this.SendUpdate();
        break;
      }
    }
  }

  SetMods(user, mods) {
    console.log(`[i] [MP-${this.id}] Updated mods for ${user.username}.`);
    for(var s = 0; s < 16; s++) {
      if(this.slots[s].userID == user.user_id) this.slots[s].mods = mods;
    }
    this.SendUpdate();
  }

  ToggleTeams(user) {
    for(var s = 0; s < 16; s++) {
      if(this.slots[s].userID == user.user_id) {
        if(this.slots[s].status == SlotStatus.NotReady) {
          this.slots[s].status = SlotStatus.Ready;
        } else {
          this.slots[s].status = SlotStatus.NotReady;
        }
      }
    }
    this.SendUpdate();
  }

  HasBeatmap(user, hasBeatmap) {
    console.log(`[i] [MP-${this.id}] ${user.username} ${hasBeatmap ? "has" : "does not have"} this beatmap!`);
    for(var s = 0; s < 16; s++) {
      if(this.slots[s].userID == user.user_id) this.slots[s].status = hasBeatmap ? SlotStatus.NotReady : SlotStatus.NoBeatmap;
    }
    this.SendUpdate();
  }

  SetReadyState(user, ready) {
    console.log(`[i] [MP-${this.id}] ${user.username} updated ready status to ${ready ? "READY" : "NOT_READY"}.`);

    for(var s = 0; s < 16; s++) {
      if(this.slots[s].userID == user.user_id) this.slots[s].status = ready ? SlotStatus.Ready : SlotStatus.NotReady;
    }
    this.SendUpdate();
  }

  StartMatch() {
    if(this.OnlinePlayers < 2) {
      console.log(`[i] [MP-${this.id}] No enough players to start this match.`);
      return;
    }
    this.inProgress = true;

    console.log(`[i] [MP-${this.id}] Starting the match!`);

    this.slots.forEach(slot => {
      if(slot.userID == -1) return;
      slot.status = SlotStatus.Playing;
      TokenManager.FindUserID(slot.userID).enqueue(Packets.MatchStart(this));
    });

    this.SendUpdate();
  }

  SetLoaded(user) {
    console.log(`[i] [MP-${this.id}] ${user.username} got his beatmap loaded!`);
    for(var s = 0; s < 16; s++) {
      if(this.slots[s].userID == user.user_id) this.slots[s].loaded = true;
    }

    if(this.slots.filter(s => s.loaded).length == this.OnlinePlayers) {
      console.log(`[i] [MP-${this.id}] Match will start soon!`);
      this.slots.forEach(slot => {
        if(slot.userID == -1) return;
        TokenManager.FindUserID(slot.userID).enqueue(Packets.AllPlayersLoadedMatch());
      });
    }

    this.SendUpdate();
  }

  UpdateScore(user, score) {
    console.log(`[i] [MP-${this.id}] Received a score frame update for ${user.username}!`);
    for(var s = 0; s < 16; s++) {
      if(this.slots[s].userID == user.user_id) {
        score.id = s;
        break;
      }
    }

    this.SendToPlayers(Packets.ScoreFrame(score));
  }

  FailPlayer(user) {
    console.log(`[i] [MP-${this.id}] ${user.username} failed!`);
    var slot = 0;

    for(var s = 0; s < 16; s++) {
      if(this.slots[s].userID == user.user_id) {
        slot = s;
        break;
      }
    }

    this.SendToPlayers(Packets.UserFailed(slot));
  }

  PlayerCompleted(user) {
    console.log(`[i] [MP-${this.id}] ${user.username} completed!`);
    for(var s = 0; s < 16; s++) {
      if(this.slots[s].userID == user.user_id) {
        this.slots[s].complete = true;
        break;
      }
    }

    if(this.slots.filter(s => s.complete).length == this.OnlinePlayers) {
      console.log(`[i] [MP-${this.id}] All players are done! Match is over.`);
      this.inProgress = false;
      for(var s = 0; s < 16; s++) {
        if(this.slots[s].status == SlotStatus.Playing) {
          this.slots[s].status = SlotStatus.NotReady;
          this.slots[s].complete = false;
          this.slots[s].loaded = false;
          this.slots[s].skip = false;
        }
      }
      this.SendUpdate();
      this.SendToPlayers(Packets.MatchComplete());
    } else {
      this.SendUpdate();
    }
  }

  SendToPlayers(data) {
    this.slots.forEach(slot => {
      if(slot.userID == -1) return;
      TokenManager.FindUserID(slot.userID).enqueue(data);
    });
  }

  RemoveUser(user) {
    for(var s = 0; s < 16; s++) {
      if(this.slots[s].userID == user.user_id) {
        const slot = this.GetSlot(s);
        slot.status = SlotStatus.Free;
        slot.userID = -1;
        slot.mods = 0;
        slot.team = 0;
        this.SetSlot(s, slot);

        console.log(`[i] [MP-${this.id}] ${user.username} left the room.`);
        this.SendUpdate();

        if(user.user_id == this.hostUserID) {
          console.log(`[i] [MP-${this.id}] Host left the room. Giving host privilege to another player...`);
          for(var i = 0; i < 16; i++) {
            if(this.slots[i].status != SlotStatus.Free && this.slots[i].status != SlotStatus.Locked) {
              this.SetHost(TokenManager.FindUserID(this.slots[i].userID).user);
              break;
            }
          }
        }
        break;
      }
    }
  }

  get OnlinePlayers() {
    return this.slots.filter(slot => slot.status != SlotStatus.Free && slot.status != SlotStatus.Locked).length;
  }

  SetHost(user) {
    this.hostUserID = user.user_id;
    const u = TokenManager.FindUserID(user.user_id);
    u.enqueue(Packets.MatchTransferHost());
    console.log(`[i] [MP-${this.id}] New host: ${user.username}`);
    this.SendUpdate();
  }

  UpdatePassword(password) {
    this.password = password;
    this.slots.forEach(slot => {
      if(slot.status != SlotStatus.Free && slot.status != SlotStatus.Locked && slot.userID > 0)
        TokenManager.FindUserID(slot.userID).enqueue(Packets.UpdatePassword(this.password));
    });
    this.SendUpdate();
  }

  SetSlot(slot, slot_data) {
    this.slots[slot].status = slot_data.status;
    this.slots[slot].team = slot_data.team;
    this.slots[slot].userID = slot_data.userID;
    this.slots[slot].mods = slot_data.mods;
    this.slots[slot].loaded = slot_data.loaded;
    this.slots[slot].skip = slot_data.skip;
    this.slots[slot].complete = slot_data.complete;
  }

  GetSlot(slot) {
    return this.slots[slot];
  }

  SendUpdate() {
    console.log(`[i] [MP-${this.id}] Send update!`);
    TokenManager.EnqueueToMultiple(PlayersInLobby.filter(x => x != this.hostUserID), Packets.MatchInfo(this));
    this.slots.forEach(slot => {
      if(slot.status != SlotStatus.Free && slot.status != SlotStatus.Locked && slot.userID > 0)
        TokenManager.FindUserID(slot.userID).enqueue(Packets.MatchInfo(this));
    });
  }

  SetSlotMods(slot, mods) {
    const new_data = this.GetSlot(slot);
    new_data.mods = mods;
    this.SetSlot(slot, new_data);
		this.SendUpdate();
    console.log(`[i] [MP-${this.id}] Updated mods for Slot #${slot}: ${mods}`);
  }

  SetSlotReady(slot, ready) {
    if(ready != SlotStatus.Ready || ready != SlotStatus.NotReady) throw new Error(`Invalid slot status: ${ready}`);
    this.slots[slot].status = ready;
    this.SendUpdate();

    var state = "Ready";
    if(ready == SlotStatus.NotReady) state = "Not Ready";

    console.log(`[i] [MP-${this.id}] Slot #${slot} changed status to ${state}!`);
  }
}

exports.Match = Match;
