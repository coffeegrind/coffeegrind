var TimeBit = function() {
  // use short var names to save space
  // start time
  this.s = new Date().getTime();
  // end time
  this.e = null;
}

var Project = function(name, date) {
  //Constructor baby!
  this.dateCreated = date || new Date();
  this.name = name;
  this.activeTime;
  this.timeBits = [];
  this.projectDirectory;
};

Project.prototype.addStart = function() {
  this.activeTime = new TimeBit();
}

Project.prototype.addEnd = function() {
  if (!this.activeTime) return;

  this.activeTime.e = new Date().getTime();

  if (this.activeTime.e - this.activeTime.s > 0) {
    this.timeBits.push(this.activeTime);
  }
  this.activeTime = undefined;
}

/** Returns total time elapsed in MS. */
Project.prototype.getTimeElapsed = function() {
  var count = 0;
  var timeBits = this.timeBits;
  for (var i=0,n=timeBits.length; i < n; i++) {
    count += (timeBits[i].e - timeBits[i].s);
  }
  
  if (this.activeTime) {
    count += (new Date().getTime() - this.activeTime.s);
  }

  return count;
}

/** Converts MS to "HH:MM". */
Project.prototype.getHumanTime = function() {
  var sec = Math.floor(this.getTimeElapsed() / 1000);
  var minutes = Math.floor(sec / 60);
  var hours = Math.floor(sec / 3600);

  if (hours   < 10) {hours   = '0'+hours;}
  if (minutes < 10) {minutes = '0'+minutes;}
  var time    = hours+':'+minutes;
  
  // debug, show seconds to test live updating
  var seconds = sec % 60;
  if (seconds < 10) seconds = '0'+seconds;
  time += ':'+seconds;
  
  return time;
}

Project.prototype.setProjectDirectory = function(directoryName) {
  this.projectDirectory = directoryName;
}

module.exports = Project;
