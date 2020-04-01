function ParsePacket(packet) {
  var offset = 0;
  var packets = [];

  while(offset < packet.length) {
    const packet_type = packet.readUInt16LE(offset),
        packet_length = packet.readUInt32LE(offset + 3);

    const packet_data = new Buffer.from(packet.slice(offset + 7, offset + packet_length + 7));

    packets.push({
      "type": packet_type,
      "data": packet_data
    });

    offset = offset + packet_length + 7;
  }

  return packets;
}

module.exports = ParsePacket;
