var project = require('./project.js');
var saver = require('./saver.js');

var use = function (projectName) {
  this.projectName = projectName;
  this.inUse;
  this.backUP;
}

use.prototype.create = function(cb) {
  var self = this;
  saver.check(projectName, function(isDirectory){
    if (isDirectory) {
      console.log("Your Good");
      cb(true);
    } else {
      self.inUse = new project(projectName);
      self.backUP = self.inUse;
    }
  });
}

use.prototype.load = function() {
  var self = this;
  saver.read(projectName, function(data){
    self.inUse = data;
    self.backUP = self.inUse;
  });
}

use.prototype.start = function() {
  this.inUse.addStart();
}

use.prototype.stop = function() {
  this.inUse.addEnd();
  saver.write(projectName, inUse, function(error){
    console.log(error);
  });
}

module.exports = use;
