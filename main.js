function nocache(module) {require("fs").watchFile(require("path").resolve(module), () => {delete require.cache[require.resolve(module)]})}

var express = require('express');
var path = require('path');
var https = require('https');
var http = require('http');
var fs = require('fs');
var app = express();
var avatar_app = express();
var concat = require('concat-stream');
nocache("./utils/database");
nocache("./utils/ipc");
nocache('./routes');
var db = require("./utils/database");
var ipc = require("./utils/ipc");
const EventHandler = require('./events/EventHandler');
const Config = require('./global/config.json');

var options = {
  key: fs.readFileSync(Config.certs.key),
  cert: fs.readFileSync(Config.certs.certificate)
};

app.set('trust proxy', 'loopback')
avatar_app.set('trust proxy', 'loopback')

app.use(function (req, res, next) {
  console.log(`${req.method} ${req.path} - ${req.ip} - ${new Date()} - ${req.get('User-Agent')}`)
  if(req.get('User-Agent') != 'osu!' && req.method == 'post') {
	   res.status(400).send("Unauthorized!");
  } else {
	req.pipe(concat(function(data){
		req.body = data;
		next();
	}));
  }
})
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.use(EventHandler.Router);

avatar_app.get("/:id", function (req, res, next) {
  if(isNaN(req.params.id)) {
    res.sendFile(path.join(__dirname, './avatars', 'default_avatar.png'));
    return;
  }
  console.log(`[AVATAR:${req.params.id}] ${req.ip} - ${new Date()} - ${req.get('User-Agent')}`);
  var user = db.find_user(req.params.id);
  if(!user) {
    if(ipc.GetBotAvatar(req.params.id)) {
      var avatar = Buffer.from(ipc.GetBotAvatar(req.params.id), 'base64');
      res.writeHead(200, {
       'Content-Type': 'image/png',
       'Content-Length': avatar.length
      });
      res.end(avatar);
    } else {
      res.write("no avatar");
      //res.sendFile(path.join(__dirname, './avatars', 'default_avatar.png'));
    }
  } else {
    if(user.avatar != null) {
      res.sendFile(path.join(__dirname, './avatars/user', user.avatar));
    } else {
      res.sendFile(path.join(__dirname, './avatars', 'default_avatar.png'));
    }
  }
})

https.createServer(options, app).listen(Config.ports.web, () => console.log(`osu!katakuna listening on port ${Config.ports.web}`));
https.createServer(options, avatar_app).listen(Config.ports.avatar, () => console.log(`osu!katakuna avatar server listening on port ${Config.ports.avatar}`));
if(Config.ipc == true)
  ipc.start_ipc(() => console.log("IPC server started successfully!"));
