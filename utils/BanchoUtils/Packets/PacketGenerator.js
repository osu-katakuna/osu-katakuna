const { PackString, ReadString } = require('./Utils');
const Int64LE = require("int64-buffer").Int64LE;

const Type = {
  String: 0,
  Byte: 1,
  Raw: 2,
  Int32: 3,
  Int64: 4,
  Float: 5,
  Int16: 6,
  UInt32: 7
};

function TypeSizeCalculator(type, data) {
  if(type == Type.String)
    return 2 + data.length;
  else if(type == Type.Byte)
    return 1;
  else if(type == Type.Raw)
    return data.length;
  else if(type == Type.Int32 || type == Type.UInt32)
    return 4;
  else if(type == Type.Int16)
    return 2;
  else if(type == Type.Float)
    return 4;
  else if(type == Type.Int64)
    return 8;
}

function BuildPacket(__packet) {
  var data_size = 0;
  __packet.data.forEach((p) => data_size += TypeSizeCalculator(p.type, p.value)); // calculate packet size

  var packet = new Buffer.alloc(7 + data_size);

  var offset = 7; // start at 7
  packet.writeInt16LE(__packet.type, 0); // packet type
  packet.writeInt8(0x00, 2);
  packet.writeInt32LE(data_size, 3); // data_size

  __packet.data.forEach((p) => {
    if(p.type == Type.String)
      PackString(p.value).copy(packet, offset);
    else if(p.type == Type.Byte)
      packet.writeInt8(p.value, offset);
    else if(p.type == Type.Int32)
      packet.writeInt32LE(p.value, offset);
    else if(p.type == Type.UInt32)
      packet.writeUInt32LE(p.value, offset);
    else if(p.type == Type.Int16)
      packet.writeInt16LE(p.value, offset);
    else if(p.type == Type.Float)
      packet.writeFloatLE(p.value, offset);
    else if(p.type == Type.Int64) {
      const v = new Int64LE(p.value).toBuffer();
      v.copy(packet, offset);
    } else if(p.type == Type.Raw)
      new Buffer.from(p.value).copy(packet, offset);
    offset += TypeSizeCalculator(p.type, p.value)
  });

  return packet;
}

module.exports = {
  BuildPacket,
  Type
}
