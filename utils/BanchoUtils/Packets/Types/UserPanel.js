const PacketGenerator = require('../PacketGenerator');
const PacketConstant = require('../PacketConstants');

module.exports = (user) => PacketGenerator.BuildPacket({
  type: PacketConstant.server_userPanel,
  data: [
    {
      type: PacketGenerator.Type.UInt32,
      value: user.user_id
    },
    {
      type: PacketGenerator.Type.String,
      value: user.username
    },
    {
      type: PacketGenerator.Type.Byte,
      value: user.timezone
    },
    {
      type: PacketGenerator.Type.Int16,
      value: user.country
    },
    {
      type: PacketGenerator.Type.Byte,
      value: user.userRank
    },
    {
      type: PacketGenerator.Type.Float,
      value: user.longitude
    },
    {
      type: PacketGenerator.Type.Float,
      value: user.latitude
    },
    {
      type: PacketGenerator.Type.Int32,
      value: user.rank
    }
  ]
});
