const globalShortcut = require('electron').globalShortcut;

const arraysEqual = require('./helpers').arraysEqual;
const accelerators = require('./menu').accelerators;
const nodePersist = require('node-persist');
const path = require('path');
const storage = nodePersist.create({dir: __dirname + '/../persist/user'});
storage.initSync();

const parseObject = require('./helpers').parseObject;

// constants
const IS_MAC = process.platform === 'darwin';
const MS_SECONDS = 1000;
const MS_MINUTES = 60 * MS_SECONDS;
const FILENAME = 'settings.json';

// defaults
const DEFAULT_IDLE_TIME = 2 * MS_MINUTES;
const DEFAULT_CMD_TIMER = 'Ctrl+Shift+T';
const DEFAULT_CMD_WINDOW = 'Ctrl+Shift+C';

/**
 * User settings. Valdiates and saves itself to disk.
 * This can be generalized to a default storage class.
 */
var Config = function() {
  this.idleTime = DEFAULT_IDLE_TIME;
  this.cmdTimer = DEFAULT_CMD_TIMER;
  this.cmdWindow = DEFAULT_CMD_WINDOW;
};

var instance = false;
Config.getInstance = function() {
  if (!instance) {
    instance = parseObject(Config, storage.getItem(FILENAME));
  }
  return instance;
};

Config.prototype.set = function(key, value) {
  if (!this.validate(key, value)) return false;

  if (key in this && typeof this[key] !== 'function') {
    this[key] = value; 
    storage.setItem(FILENAME, this);
    return true;
  }
  return false;
}

Config.prototype.get = function(key) {
  if (key in this && typeof this[key] !== 'function') {
    return this[key];
  }
  return undefined;
}

Config.prototype.keys = function() {
  var keys = [];
  for (var key in this) {
    if (typeof this[key] !== 'function') {
      keys.push(key);
    }
  } 
  return keys;
}

Config.prototype.validate = function(key, value) {
  if (key.indexOf('cmd') == 0) {
    // must have at least one modifier, use a key and not be reserved
    return value.indexOf('+') >= 0 && !value.endsWith('+') && canRegisterShortcut(value);
  }

  return true;
};

/** Returns true if our app is using the command. */
function isReservedCmd(cmdStr) {
  cmdStr = cmdStr.replace('CmdOrCtrl', IS_MAC ? 'Cmd' : 'Ctrl');
  var cmdParts = cmdStr.split('+');
  
  for (var i=0, n=accelerators.length; i<n; i++) {
    var cmd = accelerators[i];
    // favor abbreviations
    cmd = cmd.replace('Command', 'Cmd');
    cmd = cmd.replace('Control', 'Ctrl');
    cmd = cmd.replace('CmdOrCtrl', IS_MAC ? 'Cmd' : 'Ctrl');
    
    if (cmd == cmdStr || arraysEqual(cmdParts, cmd.split('+'))) {
      return true;
    }
  }
  
  return false;
}

/** Returns true if the cmdStr can be registered. */
function canRegisterShortcut(cmdStr) {
    if (isReservedCmd(cmdStr)) return false;
    var success = globalShortcut.register(cmdStr, function(){
      alert('App restart required');
    });
    globalShortcut.unregister(cmdStr);

    return success;
}

module.exports = Config.getInstance();
