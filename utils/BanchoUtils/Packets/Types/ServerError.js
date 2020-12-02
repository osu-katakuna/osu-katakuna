const PacketGenerator = require('../PacketGenerator');
const PacketConstant = require('../PacketConstants');

module.exports = () => PacketGenerator.BuildPacket({
  type: PacketConstant.server_userID,
  data: [
    {
      type: PacketGenerator.Type.Int32,
      value: -5
    }
  ]
});
