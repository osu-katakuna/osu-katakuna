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
      { parameter: "team", type: Type.Byte }
    ],
    length: 16
  }
];

const data_template_2 = [
  { parameter: "hostUserID", type: Type.Int32 },
  { parameter: "gameMode", type: Type.Byte },
  { parameter: "scoringType", type: Type.Byte },
  { parameter: "teamType", type: Type.Byte },
  { parameter: "freeMods", type: Type.Byte }
];

module.exports = (data) => {
  const match_data1 = Parser.ParseDataFromTemplate(data, data_template);
  const offset = Parser.CalculateOffset(data, data_template);
  var userIDs_raw = data.slice(offset);
  var calc_offset = match_data1.name.length + match_data1.password.length + match_data1.beatmapName.length + match_data1.beatmapMD5.length;

  match_data1.slots.forEach(s => {
    if(s.status != SlotStatus.Free && s.status != SlotStatus.Locked) {
      s.userID = userIDs_raw.readUInt32LE(0);
      userIDs_raw = userIDs_raw.slice(4);
    } else {
      s.userID = -1;
    }
  });

  var match_data2 = Parser.ParseDataFromTemplate(userIDs_raw, data_template_2);
  return { ...match_data1, ...match_data2 };
}
