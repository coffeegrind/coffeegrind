const MS_SECONDS = 1000;
const MS_MINUTES = 60 * SECONDS;
const DEFAULT_IDLE_TIME = 60 * MS_SECONDS;

/**
 * User settings. Valdiates and saves itself to disk.
 */
var Settings = function() {
  this.idleTime = DEFAULT_IDLE_TIME;
  //this.saveDir = __dirname;
};

module.exports = Settings;
