const TokenManager = require('./TokenManager');
const ChannelManager = require('./ChannelManager');

require('./ChannelInitialization');

var matches = [];

module.exports = {
  tokens: TokenManager,
  channels: ChannelManager
}
