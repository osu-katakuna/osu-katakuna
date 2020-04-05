const Parser = require('./Parser');
const { Type } = require('../Utils/PacketUtils');

const data_template = [
  { parameter: "actionID", type: Type.Byte },
  { parameter: "actionText", type: Type.String },
  { parameter: "actionMD5", type: Type.String },
  { parameter: "actionMods", type: Type.UInt32 },
  { parameter: "gameMode", type: Type.Byte }
];

module.exports = (data) => Parser.ParseDataFromTemplate(data, data_template);
