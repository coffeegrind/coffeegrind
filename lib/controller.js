var Project = require('./project');
var helpers = require('./helpers');
var slugify = helpers.slugify;
var parseObject = helpers.parseObject;

/**
 * ProjectController to handle interactions between the user and the datastore.
 */
var ProjectController = function(storage) {
  this.storage = storage;
  this.activeProject = false;
  this.started = false;
}

ProjectController.prototype.getAllProjects = function(cb) {
  return this.storage.keys();
}

/** Loads the given project stopping activeProject if it exists. */
ProjectController.prototype.use = function(projectKey) {
  if (this.activeProject) {
    this.stop();
  }
  
  var project = this._load(projectKey);
  
  if (!project) {
    // TODO: try to restore backup
    project = new Project(projectKey);
  }
  
  this.activeProject = project;
  console.log(project);
  this.storage.setItem(this.activeProject.name, this.activeProject);
}

/** Starts the activeProject, iff use was previously called. */
ProjectController.prototype.start = function() {
  if (!this.activeProject) {
    console.log('error: no active project');
    return;
  }

  if (this.started) {
    console.log('error: already started');
    return;
  }
  this.activeProject.addStart();
  this.started = true;
}

/** Stops the active project iff stop was previously called. */
ProjectController.prototype.stop = function() {
  if (!this.started) {
    console.log('error: start must be called before stop');
    return;
  }
  this.activeProject.addEnd();
  this.storage.setItem(this.activeProject.name, this.activeProject);
  this.started = false;
}

/** Toggles the active project on/off. */
ProjectController.prototype.toggle = function() {
  if (!this.activeProject) return;
  if (this.started) this.stop();
  else this.start();
}

// private functions

ProjectController.prototype._load = function(projectKey) {
  var data = this.storage.getItem(projectKey);
  if (!data || data.length == 0) return false;
  return parseObject(Project, data);
}

/*var storage = require('node-persist');
storage.initSync();

var c = new ProjectController(storage);

c.use('test');
c.start();
c.stop();
console.log(c.activeProject.getTimeElapsed())
*/

module.exports = ProjectController;
