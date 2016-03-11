var Save = require('./saver.js');

var TimeBit = function() {
  this.startTime = new Date().getTime();
  this.endTime = null;
}

var Project = function(name, date) {
  //Constructor baby!
  this.timeBits = [];
  this.dateCreated = date || new Date();
  this.name = name;
  this.activeTime;
};

Project.prototype.addStart = function() {
  this.activeTime = new TimeBit()
}

Project.prototype.addEnd = function() {
  this.activeTime.endTime = new Date().getTime();

  timeBits.push(this.activeTime);
}

Project.prototype.timeElapsed = function(cb) {
  var count = 0;

  for (var iter = 0; iter < timeBits.length -1; iter++) {
    count = count + (timeBits[iter].startTime - timeBits[iter].endTime);
  }

  cb(count);
}

module.exports = Project;
