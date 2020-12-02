const PacketGenerator = require('../PacketGenerator');
const PacketConstant = require('../PacketConstants');

module.exports = (server) => PacketGenerator.BuildPacket({
  type: 107,
  data: [
    {
      type: PacketGenerator.Type.String,
      value: server
    }
  ]
});
