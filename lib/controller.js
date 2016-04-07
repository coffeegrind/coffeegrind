var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Project = require('./project');
var helpers = require('./helpers');
var slugify = helpers.slugify;
var parseObject = helpers.parseObject;

/**
 * ProjectController to handle interactions between the user and the datastore.
 * TODO: safe save projects
 */
var ProjectController = function(storage) {
  EventEmitter.call(this);
  
  this.storage = storage;
  this.activeProject = false;
  this.started = false;
  // keeps track of the last action the user performed
  this.userState = false;
  this.id = this.storage.getItem('id') || 1;
}
util.inherits(ProjectController, EventEmitter);

var instance;
ProjectController.getInstance = function(storage) {
  if (!instance) {
    if (!storage) {
      console.log('error: storage not set');
      return false;
    }
    instance = new ProjectController(storage);
  }
  
  return instance;
};

/** May return invalid project names. */
ProjectController.prototype.getProjectKeys = function() {
  var keys = this.storage.keys();
  var index = keys.indexOf('id');
  if (index >= 0) keys.splice(index, 1);
  return keys;
}

ProjectController.prototype.getProjects = function() {
  var self = this;
  // loads all projects, filtering out falsy objects
  return this.storage.keys()
    .map((e) => { return self._load(e) })
    .filter((e) => { return e; })
    .sort((a, b) => {
      return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime();
    });
}

/** Loads the given project stopping activeProject if it exists. */
ProjectController.prototype.use = function(projectKey) {
  if (this.activeProject) {
    this.stop();
  }
  
  projectKey = projectKey.id || projectKey;

  // check valid key
  if (!projectKey || projectKey.length == 0) return false;
  
  var project = this._load(projectKey);
  
  if (!project) {
    // TODO: try to restore backup
    var id = slugify(this.id + ' ' + projectKey) + '.json';
    this.storage.setItem('id', ++this.id);
    project = new Project(id, projectKey);
  }
  
  this.activeProject = project;
  this.save(this.activeProject);
  
  return this.activeProject;
}

/** Starts the activeProject, iff use was previously called. */
ProjectController.prototype.start = function() {
  if (!this.activeProject) {
    // no active project
    return false;
  }

  if (this.started) {
    //console.log('error: already started');
    return false;
  }
  
  this.emit('start', this.activeProject);
  
  this.activeProject.start();
  this.started = true;
}

/** Stops the active project iff stop was previously called. */
ProjectController.prototype.stop = function() {
  if (!this.started) {
    //console.log('error: start must be called before stop');
    return false;
  }
  
  this.activeProject.stop();

  this.emit('stop', this.activeProject);
  
  this.save(this.activeProject);
  this.started = false;
}

/** Saves an arbitrary project. Use project id so even if id schema changes this will work. */
ProjectController.prototype.save = function(project) {
  this.storage.setItem(project.id, project);
};

/** Deletes a project from storage. */
ProjectController.prototype.delete = function(project) {
  this.storage.removeItem(project.id);
};

/** User toggles the active project on/off. */
ProjectController.prototype.toggle = function(project) {
  if (!project) project = this.activeProject;
  if (!project) {
    // no active project, assume the first project
    var projects = this.getProjects();
    if (!projects) return false;
    this.activeProject = projects[0];
  }
  
  if (!this.activeProject || this.activeProject.id != project.id) {
    if (this.activeProject) this.stop();
    if (project.id) this.use(project.id);
  }
  if (this.started) this.stop();
  else this.start();
  
  return this.userState = this.started;
}

// private functions

ProjectController.prototype._load = function(projectId) {
  var data = this.storage.getItem(projectId);
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
