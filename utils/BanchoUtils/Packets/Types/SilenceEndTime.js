const PacketGenerator = require('../PacketGenerator');
const PacketConstant = require('../PacketConstants');

module.exports = (user) => PacketGenerator.BuildPacket({
  type: PacketConstant.server_silenceEnd,
  data: [
    {
      type: PacketGenerator.Type.Int32,
      value: user.silenceTime
    }
  ]
});
