const { ReadString } = require('../Packets/Utils');

module.exports = (packet) => {
  var actionText = ReadString(packet, 0);
  var actionMD5 = ReadString(packet, 2 + actionText.length);
  var actionMods = packet.readInt8(packet.length - 9);

  return {
    "actionID": packet[0],
    "actionText": actionText,
    "actionMD5": actionMD5,
    "actionMods": actionMods,
    "gameMode": packet[packet.length - 1]
  };
}
