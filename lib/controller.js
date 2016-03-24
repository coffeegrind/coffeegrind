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

/** May return invalid project names. */
ProjectController.prototype.getProjectNames = function() {
  return this.storage.keys();
}

ProjectController.prototype.getProjects = function() {
  var self = this;
  // tries to load all projects, filtering out falsy objects
  return this.storage.keys().map((e) => { return self._load(e) }).filter((e) => { return e; });
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
  this.save(this.activeProject);
  this.started = false;
  
  return this.activeProject;
}

/** Starts the activeProject, iff use was previously called. */
ProjectController.prototype.start = function() {
  if (!this.activeProject) {
    console.log('error: no active project');
    return false;
  }

  if (this.started) {
    console.log('error: already started');
    return false;
  }
  
  this.activeProject.addStart();
  this.started = true;
}

/** Stops the active project iff stop was previously called. */
ProjectController.prototype.stop = function() {
  if (!this.started) {
    console.log('error: start must be called before stop');
    return false;
  }
  
  this.activeProject.addEnd();
  this.save(this.activeProject);
  this.started = false;
}

/** Saves an arbitrary project. */
ProjectController.prototype.save = function(project) {
  this.storage.setItem(project.name, project);
};

/** Toggles the active project on/off. */
ProjectController.prototype.toggle = function(project) {
  if (!this.activeProject || this.activeProject.name != project.name) {
    if (this.activeProject) this.stop();
    this.use(project.name);
  }
  if (this.started) this.stop();
  else this.start();
  
  return this.started;
}

// private functions

ProjectController.prototype._load = function(projectKey) {
  var data = this.storage.getItem(projectKey);
  if (!data || data.length == 0) return false;
  return parseObject(Project, data);
}

/*var storage = require('node-persist');
storage.initSync({__dirname: '/persist/projects'});

var c = new ProjectController(storage);

c.use('test');
c.start();
c.stop();
console.log(c.activeProject.getTimeElapsed())
*/

module.exports = ProjectController;
