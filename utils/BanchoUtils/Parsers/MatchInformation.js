const Parser = require('./Parser');
const { Type } = require('../Utils/PacketUtils');
const SlotStatus = require('../Packets/Constants/SlotStatus');

const data_template = [
  { parameter: "matchID", type: Type.Int16 },
  { parameter: "inProgress", type: Type.Byte },
  { parameter: "gameType", type: Type.Byte },
  { parameter: "mods", type: Type.UInt32 },
  { parameter: "name", type: Type.String },
  { parameter: "password", type: Type.String },
  { parameter: "beatmapName", type: Type.String },
  { parameter: "beatmapID", type: Type.UInt32 },
  { parameter: "beatmapMD5", type: Type.String },
  { parameter: "slots",
    type: Type.ArrayOfValues,
    template: [
      { parameter: "status", type: Type.Byte },
      { parameter: "team", type: Type.Byte },
      { parameter: "id", type: Type.UInt32, condition: (v, obj, i) => (obj.slots[i].status != SlotStatus.Free && obj.slots[i].status != SlotStatus.Locked) }
    ],
    length: 16
  },
  { parameter: "hostUserID", type: Type.Int32 },
  { parameter: "gameMode", type: Type.Byte },
  { parameter: "scoringType", type: Type.Byte },
  { parameter: "teamType", type: Type.Byte },
  { parameter: "freeMods", type: Type.Byte }
];

module.exports = (data) => Parser.ParseDataFromTemplate(data, data_template);
