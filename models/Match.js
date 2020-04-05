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
        this.SetSlot(s, slot);

        console.log(`[i] [MP-${this.id}] ${user.username} joined the room.`);
        const u = TokenManager.FindUserID(user.user_id);
        u.enqueue(Packets.MatchJoinSuccess(this));
        this.SendUpdate();
        break;
      }
    }
  }

  RemoveUser(user) {
    for(var s = 0; s < 16; s++) {
      if(this.slots[s].userID == user.user_id) {
        const slot = this.GetSlot(s);
        slot.status = SlotStatus.Free;
        slot.userID = 0;
        slot.mods = 0;
        slot.team = 0;
        this.SetSlot(s, slot);

        console.log(`[i] [MP-${this.id}] ${user.username} left the room.`);
        this.SendUpdate();
        break;
      }
    }
  }

  SetHost(user) {
    this.hostUserID = user.user_id;
    const u = TokenManager.FindUserID(user.user_id);
    u.enqueue(Packets.MatchTransferHost());
    console.log(`[i] [MP-${this.id}] New host: ${user.username}`);
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
    return {
      status: this.slots[slot].status,
      team: this.slots[slot].team,
      userID: this.slots[slot].userID,
      mods: this.slots[slot].mods,
      loaded: this.slots[slot].loaded,
      skip: this.slots[slot].skip,
      complete: this.slots[slot].complete
    };
  }

  SendUpdate() {
    console.log(`[i] [MP-${this.id}] Send update!`);
    TokenManager.EnqueueToMultiple(PlayersInLobby, Packets.MatchInfo(this));
    this.slots.forEach(slot => {
      if(slot.status != SlotStatus.Free && slot.status != SlotStatus.Locked)
        TokenManager.FindUserID(slot.userID).enqueue(Packets.MatchInfo(this));
    });
    TokenManager.FindUserID(this.hostUserID).enqueue(Packets.MatchInfo(this));
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
