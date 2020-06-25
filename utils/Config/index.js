const Database = require('../Database/');

console.log("osu!katakuna - loading configuration...");

function GetConfig(name) {
  var entry = Database.GetConfigEntry(name);
  return entry == undefined ? "" : entry.value;
}

function AddDefaultConfig(name, defaultValue) {
  var entry = Database.GetConfigEntry(name);
  if(entry == undefined) {
    Database.SetConfigEntry(name, defaultValue);
  }
}

function GetAllConfiguration() {
  AddDefaultConfig("login.message", "Welcome to {servername}, {username}!");
  AddDefaultConfig("server.name", "katakuna!clone");
  AddDefaultConfig("homepage.title", "Welcome back, {username}!");
  AddDefaultConfig("homepage.message", "Welcome back on {servername}. There are {users} registered user(s) and {online_users} online user(s). It's a beautiful day to play some maps, isn't it?");
  AddDefaultConfig("banned.message", "We're sorry {username}, but you are banned on {servername}. If you want to appeal, please contact us at accounts@katakuna.cc");
}

GetAllConfiguration();
console.log("osu!katakuna - config loaded.");

module.exports = {
  GetConfig,
  GetAllConfiguration
};
