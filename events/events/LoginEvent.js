const Event = require('../../models/Event').Event;
const Database = require('../../utils/Database/');
const Packets = require('../../utils/BanchoUtils/Packets');
const Tokens = require("../../global/global").tokens;
const ChannelManager = require("../../global/global").channels;
var crypto = require('crypto');

class LoginEvent extends Event {
  constructor() {
    super();
    this.name = "LoginEvent";
    this.type = -1;
  }

  onLoginSuccess(loginData, res, token, ip) {
    const user = Database.GetUser(loginData.username);

    if(user.banned) {
      console.log(`[*] User ${loginData.username} tried to connect, but it's banned!`);
      res.write(Packets.Notification(`You are banned on osu!katakuna! Please appeal in our forums at katakuna.cc`));
      res.write(Packets.LoginBanned());
      return;
    }

    Database.SetUserToken(user.user_id, token, ip);
    if(Tokens.FindUsernameToken(loginData.username) && !loginData.client_build.endsWith("tourney")) {
      console.log(`[-] Found a token referenced to this user! Revoking token.`);
      const old_token = Tokens.FindUsernameToken(loginData.username);
      old_token.LeaveAllChannels();
      Tokens.RemoveToken(old_token.token);
    }
    Tokens.AddUserToken(user, token);
    Tokens.ForceUpdateStats(user.user_id);

    console.log(`[*] User ${loginData.username} authenticated successfully!`);
    res.write(Packets.Notification(`Welcome to Katakuna, ${loginData.username}!`));

    res.write(Packets.SilenceEndTime(user));
    res.write(Packets.UserID(user));
    res.write(Packets.ProtocolVersion(19));

    res.write(Packets.UserSupporterGMT(user));
    res.write(Packets.UserPanel(user));
    res.write(Packets.UserStats(user));
    res.write(Packets.ChannelInfoEnd());

    Tokens.EnqueueAllExcept(user.user_id, Packets.UserPanel(user));
    Tokens.EnqueueAllExcept(user.user_id, Packets.UserStats(user));

    ChannelManager.GetAllChannelsDesc().forEach((d) => res.write(Packets.ChannelInfo(d)));
    ChannelManager.JoinChannel("#osu", user);
    ChannelManager.JoinChannel("#announce", user);

    Tokens.OnlineUsers().filter(u => u.user_id != user.user_id).forEach((u) => {
      res.write(Packets.UserPanel(u));
      res.write(Packets.UserStats(u));
    });

    res.write(Packets.FriendsList(user.friends));
  }

  onLoginFailure(loginData, res) {
    console.log(`[*] User ${loginData.username} failed to authenticate: Wrong credentials provided.`);
    res.write(Packets.LoginFailure());
  }

  run(args) {
    const { res, loginData, token, ip } = args;
    if(Database.ValidateLogin(loginData.username, crypto.createHash('sha256').update(loginData.password).digest('hex'))) this.onLoginSuccess(loginData, res, token, ip);
    else this.onLoginFailure(loginData, res);
  }
}

module.exports = LoginEvent;
