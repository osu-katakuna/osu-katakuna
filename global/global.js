const TokenManager = require('./TokenManager');
const ChannelManager = require('./ChannelManager');
const MatchManager = require('./MatchManager');

require('./ChannelInitialization');

var PlayersInLobby = [];

module.exports = {
  tokens: TokenManager,
  channels: ChannelManager,
  matches: MatchManager,
  PlayersInLobby
}
