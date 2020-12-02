const PacketGenerator = require('../PacketGenerator');
const PacketConstant = require('../PacketConstants');

module.exports = (user) => PacketGenerator.BuildPacket({
  type: PacketConstant.server_userStats,
  data: [
    {
      type: PacketGenerator.Type.Int32,
      value: user.user_id
    },
    {
      type: PacketGenerator.Type.Byte,
      value: user.stats.status.actionID
    },
    {
      type: PacketGenerator.Type.String,
      value: user.stats.status.actionText
    },
    {
      type: PacketGenerator.Type.String,
      value: user.stats.status.actionMD5
    },
    {
      type: PacketGenerator.Type.UInt32,
      value: user.stats.status.actionMods
    },
    {
      type: PacketGenerator.Type.Byte,
      value: user.stats.gameMode
    },
    {
      type: PacketGenerator.Type.Int32,
      value: 0
    },
    {
      type: PacketGenerator.Type.Int64,
      value: user.stats.rankedScore
    },
    {
      type: PacketGenerator.Type.Float,
      value: user.stats.accuracy
    },
    {
      type: PacketGenerator.Type.Int32,
      value: user.stats.playCount
    },
    {
      type: PacketGenerator.Type.Int64,
      value: user.stats.totalScore
    },
    {
      type: PacketGenerator.Type.Int32,
      value: user.stats.gameRank
    },
    {
      type: PacketGenerator.Type.Int16,
      value: (user.stats.pp > 32767 ? 32767 : user.stats.pp)
    }
  ]
});
