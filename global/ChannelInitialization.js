const ChannelManager = require('./ChannelManager');

ChannelManager.CreateChannel("#osu", "osu! default channel", true);
ChannelManager.CreateChannel("#announce", "General announcements channel", true);
ChannelManager.CreateChannel("#spectator", "Spectators room", false);
ChannelManager.CreateChannel("#lobby", undefined, false);
