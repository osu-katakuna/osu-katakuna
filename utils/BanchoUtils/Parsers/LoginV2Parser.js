const Parser = require('./Parser');
const { Type } = require('../Utils/PacketUtils');

const data_template = [
  { parameter: "username", type: Type.String },
  { parameter: "password", type: Type.String },
  { parameter: "version", type: Type.String },
  { parameter: "client_build", type: Type.String },
  { parameter: "timezoneOffset", type: Type.UInt32 },
  { parameter: "displayCityLocation", type: Type.Byte },
  { parameter: "clientHash", type: Type.String },
  { parameter: "blockNonFriendPM", type: Type.Byte }
];

module.exports = (data) => Parser.ParseDataFromTemplate(data, data_template);
