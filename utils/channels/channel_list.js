const fs = require('fs');
const Channel = require("../../models/Channel").Channel;
var protocol = require('../bancho_protocol');
var cmd_queue = require("../queue");
var config = undefined;

var channel_list = [];

function readConfig() {
  if(!fs.existsSync("./channels.json")) return;
  config = JSON.parse(fs.readFileSync('./channels.json'));
}

function saveConfig() {
  fs.writeFileSync("./channels.json", JSON.stringify(config));
}

readConfig();
if(!config) {
  console.log("Channels configuration not found! Creating a new one...");
  config = {"channels": []};
  config.channels.push({
    "name": "osu",
    "description": "osu! default channel"
  });
  config.channels.push({
    "name": "announce",
    "description": "Announcements"
  });
  saveConfig();
}

config.channels.forEach((channel) => {
  channel_list.push(new Channel(channel.name, channel.description));
});

function findChannel(channel) {
  for(var i = 0; i < channel_list.length; i++) {
    if(channel_list[i].name == channel) return channel_list[i];
  }
}

function all(member) {
  var channel_desc = [];

  for(var i = 0; i < channel_list.length; i++) {
    var ch = channel_list[i];
    if(ch.conditionToJoin()) {
      channel_desc.push(protocol.generator.sendChannelInfo({"channel": `#${ch.name}`, "description": ch.description, "members": ch.members.length}));
    }
  }

  return (channel_desc.length > 0) ? new Buffer.concat(channel_desc) : new Buffer.from([0x00]);
}

function joinChannel(member, channel) {
  var ch = findChannel(channel);
  if(ch) {
    if(ch.add_member(member)) {
      cmd_queue.queueAll(protocol.generator.sendChannelInfo({"channel": `#${ch.name}`, "description": ch.description, "members": ch.members.length}))
      return protocol.generator.joinChatChannel(`#${channel}`);
    }
  }
  return protocol.generator.kickedChatChannel(`#${channel}`);
}

function partChannel(member, channel) {
  var ch = findChannel(channel);
  if(ch) {
    ch.remove_member(member)
  }
}

module.exports = {
  "all": all,
  "joinChannel": joinChannel,
  "partChannel": partChannel
}
// if(true) {
//   return new Buffer.concat([protocol.generator.joinChatChannel(`#${this.name}`)),
//     protocol.generator.sendChannelInfo({"channel": `#${this.name}`, "description": this.description})])
// } else {
//   return protocol.generator.kickedChatChannel(`#${this.name}`)
// }
