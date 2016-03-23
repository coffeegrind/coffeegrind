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

Project.prototype.getTimeElapsed = function() {
  var count = 0;
  var timeBits = this.timeBits;
  for (var i=0,n=timeBits.length; i < n; i++) {
    count += (timeBits[i].e - timeBits[i].s);
  }

  return count;
}

module.exports = Project;
