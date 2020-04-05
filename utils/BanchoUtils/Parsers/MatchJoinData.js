const Parser = require('./Parser');
const { Type } = require('../Utils/PacketUtils');

const data_template = [
  { parameter: "id", type: Type.Int32 },
  { parameter: "password", type: Type.String }
];

module.exports = (data) => Parser.ParseDataFromTemplate(data, data_template);
