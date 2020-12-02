const _fs = require('fs').promises;
const _path = require('path');
const _uuid = require("uuid").v4;

process.on('uncaughtException', function(err) {
  console.error("An internal server error has occured!");
  console.error(err.message, err.stack);
  var _err_data = `Internal server error!
Occured: ${new Date()}
Error: ${err.message}
${err.stack}
`;
  _fs.writeFile(_path.resolve(_path.dirname(require.main.filename), "./logs/errors/katakuna-error-" + _uuid() + ".log"), _err_data, function (err) {
    if (err) return console.error(err);
  }).then(() => process.exit(1));
});

const _start_date = new Date();
const log_name = `katakuna-log-${_start_date.toISOString().slice(0,16).replace("T", "-")}.log`;

var _originalConsoleLog = console.log;
var _originalConsoleError = console.error;

console.log = function() {
  _fs.appendFile(_path.resolve(_path.dirname(require.main.filename), "./logs/katakuna/" + log_name), `[DEBUG - ${new Date().getTime() - _start_date.getTime()}] ${[].slice.call(arguments)}\n`);
  _originalConsoleLog([].slice.call(arguments).join());
}

console.error = function() {
  _fs.appendFile(_path.resolve(_path.dirname(require.main.filename), "./logs/katakuna/" + log_name), `[ERROR - ${new Date().getTime() - _start_date.getTime()}] ${[].slice.call(arguments)}\n`);
  _originalConsoleError([].slice.call(arguments).join());
}

_fs.writeFile(_path.resolve(_path.dirname(require.main.filename), "./logs/katakuna/" + log_name), "Hooked console.log and console.error successfully.\n");
_originalConsoleLog(`Logger created an new log file here: ${_path.resolve(_path.dirname(require.main.filename), "./logs/katakuna/" + log_name)}`);
