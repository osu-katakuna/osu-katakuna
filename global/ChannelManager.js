const TokenManager = require('./TokenManager');
const Channel = require('../models/Channel').Channel;

var channels = [];

function SendMessage(channel, message, user) {
  if(channel[0] !== '#') {
    channel = '#' + channel;
  }
  const c = GetChannel(channel);
  const token = TokenManager.FindUserID(user.user_id);
  if(c)
    c.SendMessage(message, user);
  else
    console.log(`[X] User ${user.username} tried to send a message on an inexistent channel ${channel}`);
}

function JoinChannel(channel, user) {
  if(channel[0] !== '#') {
    channel = '#' + channel;
  }
  GetChannel(channel).AddMember(user.user_id);
}

function GetAllChannelsDesc() {
  return channels.map((channel) => {
    return {
      name: channel.name,
      description: channel.description,
      members: channel.members.length
    };
  });
}

function GetAllChannels() {
  return channels;
}

function GetChannel(channel) {
  if(channel[0] !== '#') {
    channel = '#' + channel;
  }
  for(var i = 0; i < channels.length; i++) {
    if(channels[i].name === channel) return channels[i];
  }
}

function CreateChannel(channel, description) {
  if(channel[0] !== '#') {
    channel = '#' + channel;
  }
  channels.push(new Channel(channel, description));
  console.log(`[i] Channel ${channel} was created!`);
}

module.exports = {
  SendMessage,
  GetChannel,
  CreateChannel,
  GetAllChannelsDesc,
  GetAllChannels,
  JoinChannel
};
