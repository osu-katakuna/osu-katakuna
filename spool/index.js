const fs = require('fs');
const path = require('path');
const Database = require('../utils/Database/');
const Channels = require('../global/global').channels;
const Config = require('../global/config.json');

const SPOOL_DIRECTORY = Config.windows ? "spool" : "/var/spool/katakuna"

if(!fs.existsSync(SPOOL_DIRECTORY)) {
  console.log(`[SPOOL] Spool directory not found; creating a new spool directory in '${SPOOL_DIRECTORY}'`)
  fs.mkdirSync(SPOOL_DIRECTORY);
  console.log(`[SPOOL] Created a new spool directory in '${SPOOL_DIRECTORY}'.`)
}

var actions = {
  "SendMessageToChannel": function(args, content) {
    const msgs = content.split("\n").slice(0, content.split("\n").length - 1);

    if(!args.Channel) {
      console.log("[SPOOL] No Channel Set.");
      return;
    }

    if(!args.User && (!args.UseBotID && args.UseBotID.toLowerCase() != 'true')) {
      console.log("[SPOOL] I don't know on whose behalf I should send the message. Define User.");
      return;
    }

    const user = Database.GetUser(!args.UseBotID ? args.User : (Config.misaki && Config.misaki.enabled ? Config.misaki.userid : args.User));
    if(!user) {
      console.log(`[SPOOL] I don't know this user: ${args.User}`);
      return;
    }

    if(args.UseBotID && args.UseBotID.toLowerCase() == 'true')
      user.username = args.User; // fake username

    if(args.Channel[0] === '#') {
      args.Channel = args.Channel.slice(1);
    }

    const ch = Channels.GetChannel(args.Channel);
    if(!ch) {
      console.log(`[SPOOL] I don't know this channel: ${args.Channel}`);
      return;
    }

    msgs.forEach(message => {
      console.log(`[SPOOL] Sending '${message}' to ${args.Channel} as ${args.User}...`);
      ch.SendMessage(message, user);
    });
  }
};

fs.watch(SPOOL_DIRECTORY).on('change', (x, f) => {
  if(!f) return;
  const p = path.join(SPOOL_DIRECTORY, f);

  if(!fs.existsSync(p)) return;

  const content = fs.readFileSync(p);
  if(content.length == 0) return;

  const args_raw = content.toString().split("\n\n")[0].split("\n");
  const data = content.toString().split("\n\n")[1];

  const args = [];
  args_raw.forEach(x => {
    const p = x.split(":");
    args[p[0]] = p[1];
  });

  if(!args.ContentType)
    args.ContentType = "Raw"; // default type

  if(args.ContentType == "Base64")
    data = atob(data);

  if(args.Action) {
    if(actions[args.Action]) {
      actions[args.Action](args, data);
    } else {
      console.log(`[SPOOL] malformed file '${p}': unknown action ${args.Action}.`);
    }
  } else {
    console.log(`[SPOOL] malformed file '${p}': no Action defined.`);
  }

  fs.unlinkSync(p);
});
