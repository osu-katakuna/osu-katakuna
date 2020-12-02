const TokenManager = require('./TokenManager');
const Packets = require('../utils/BanchoUtils/Packets');
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
  if(!user) return;
  console.log(`[?] Joining channel ${channel} => ${user.user_id}`);
  GetChannel(channel).AddMember(user.user_id);
}

function AutoJoinChannel(channel, user) {
  if(channel[0] !== '#') {
    channel = '#' + channel;
  }
  if(!user) return;
  console.log(`[i] Telling ${user.username} to automatically join the ${channel} channel.`);
  if(!GetChannel(channel)) {
    console.log(`[x] wut wut this channel does not exist.`);
    return;
  }
  TokenManager.FindUserID(user.user_id).enqueue(Packets.AutojoinChannel(GetChannel(channel)));
}

function LeaveChannel(channel, user) {
  if(channel[0] !== '#') {
    channel = '#' + channel;
  }
  if(!user) return;
  console.log(`[?] Leaving channel ${channel} => ${user.user_id}`);
  GetChannel(channel).RemoveMember(user.user_id);
}

function KickUser(channel, user) {
  if(channel[0] !== '#') {
    channel = '#' + channel;
  }
  GetChannel(channel).KickMember(user.user_id);
}

function GetAllChannelsDesc() {
  return channels.filter(c => c.visibleToNormalPlayers && c.description != undefined).map((channel) => {
    return {
      name: channel.name,
      description: channel.description,
      members: channel.members.length
    };
  });
}

function GetAllChannels() {
  return channels.filter(c => c.visibleToNormalPlayers);
}

function GetChannel(channel) {
  if(channel[0] !== '#') {
    channel = '#' + channel;
  }
  for(var i = 0; i < channels.length; i++) {
    if(channels[i].name === channel) return channels[i];
  }
}

function CreateChannel(channel, description, visibleToNormalPlayers) {
  if(channel[0] !== '#') {
    channel = '#' + channel;
  }
  const ch = new Channel(channel, description);
  ch.visibleToNormalPlayers = visibleToNormalPlayers;
  channels.push(ch);
  console.log(`[i] Channel ${channel} was created! Visible to players: ${visibleToNormalPlayers ? 'YES' : 'NO'}`);
}

module.exports = {
  SendMessage,
  GetChannel,
  CreateChannel,
  GetAllChannelsDesc,
  GetAllChannels,
  JoinChannel,
  KickUser,
  LeaveChannel,
  AutoJoinChannel
};
