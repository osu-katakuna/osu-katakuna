const axios = require('axios')
const Config = require('../../global/config.json');

function SendMessage(channel, message, user) {
  const ChannelManager = require('../../global/global').channels;
  if(Config.channelNotifyWebhook == undefined) return;

  var webhook = Config.channelNotifyWebhook[channel];

  if(webhook == undefined || webhook.length < 1) {
    webhook = Config.channelNotifyWebhook[channel[0] == "#" ? channel.slice(1) : channel];
    if(webhook == undefined || webhook.length < 1) {
      return;
    }
  };

  if(message.startsWith("\x01ACTION")) {
    message = "*" + user.username + message.slice(7);
  }

  if(message[message.length - 1] == "\x01") {
    message = message.substr(0, message.length - 1);
  }

  if(message.indexOf("@everyone") >= 0) {
    ChannelManager.SendMessage(channel, "Bruh... I am so sad that I need to ping everyone to get some attention...", user);
  }

  message = message.replace("@everyone", "[mention: everyone]");

  axios.post(webhook, {
    "content": message,
    "username": user.username,
    "avatar_url": Config.avatarServer + user.user_id
  }).catch((error) => {
    console.error(error)
  });
}


module.exports = {
  SendMessage
};
