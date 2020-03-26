var protocol = require('../utils/bancho_protocol')
const db = require("../utils/database")
var uuid = require("uuid").v4;
var cmd_queue = require("../utils/queue");
var ipc = require("../utils/ipc");
var channel_list = require("../utils/channels/channel_list");

function doLogin(req, res, onUserLogin, user_list) {
  const raw = req.body.slice(0).toString().split('\n')
  const username = raw[0]
  const passkey = raw[1]
  const token = uuid();
  console.log(`> Processing login attempt for '${username}' with osu! version ${req.get("osu-version")}...`)

  res.setHeader("cho-protocol", "19")
  res.setHeader("cho-token", token)
  res.writeHead(200);

  if(db.checkUser(username, passkey)) {
      var uid = db.getUserID(username, passkey);
      var user = db.find_user(uid);

      onUserLogin(user);

      var userStats = db.getUserStats(uid);
      console.log(`>> Login attempt on ${username} from ${req.ip} was successful...`)
      res.write(protocol.generator.notification(`Welcome ${username} to osu!katakuna.`))
      res.write(protocol.generator.silenceEndTime(user.silenceTime));
      res.write(protocol.generator.userID(uid));
      res.write(protocol.generator.protocolVersion(19));

      db.setUserToken(uid, token, req.ip);

      res.write(protocol.generator.userSupporterGMT(user.supporter, user.GMT));
      res.write(protocol.generator.userPanel(user));
      res.write(protocol.generator.userStats(userStats));
      res.write(protocol.generator.channelInfoEnd());
      res.write(channel_list.all(user));

      var bot_users = ipc.getBotUsers();
      user_list.forEach((__user) => {
        if(__user.id == uid) return;
        res.write(protocol.generator.userPanel(__user));
        res.write(protocol.generator.userStats(__user.stats));
      })
      bot_users.forEach((__user) => {
        res.write(protocol.generator.userPanel(__user));
        res.write(protocol.generator.userStats(__user.stats));
      });

      cmd_queue.queueAllExceptOwner(token, protocol.generator.userPanel(user));
      cmd_queue.queueAllExceptOwner(token, protocol.generator.userStats(userStats));

      var dms = db.getPMsForUser(uid);
      if(dms.length >= 1) res.write(protocol.generator.pms(dms));

      if(user.friends.length > 0) {
        res.write(protocol.generator.friendList(user.friends));
      }

      res.write(protocol.generator.menuIcon("https://i.imgur.com/xO6z6kJ.png", "https://talnaci-alexandru.ro"));
  } else {
      console.log(`>> Login attempt on ${username} from ${req.ip} FAILED!`)
      res.write(protocol.generator.login_fail())
  }
}

module.exports = doLogin;
