var project = require('./project.js');
var saver = require('./saver.js');

var use = function (projectName) {
  this.projectName = projectName;
  this.inUse;
  this.backUP;
}

use.prototype.create = function() {
  saver.check(projectName, function(isDirectory){
    if (isDirectory) {
      console.log("Your Good");
    } else {
      inUse = new project(projectName);
      backUP = inUse;
    }
  });
}

use.prototype.load = function() {
  saver.read(projectName, function(data){
    inUse = data;
    backUP = inUse;
  });
}

use.prototype.start = function() {
  inUse.addStart();
}

use.prototype.stop = function() {
  inUse.addEnd();
  saver.write(projectName, inUse, function(error){
    console.log(error);
  });
}

module.exports = use;
