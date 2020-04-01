const { ReadString } = require('../Packets/Utils');

module.exports = (packet) => {
  return ReadString(packet, 0).toString();
}
