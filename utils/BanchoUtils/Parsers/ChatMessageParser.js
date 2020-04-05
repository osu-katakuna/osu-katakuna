const Parser = require('./Parser');
const { Type } = require('../Utils/PacketUtils');

const data_template = [
  { parameter: "message", type: Type.String },
  { parameter: "channel", type: Type.String }
];

module.exports = (data) => Parser.ParseDataFromTemplate(data, data_template);
