var fs = require('fs');
var slugify = require('./helpers').slugify;

var path = __dirname;
var savePath =path +  '/.saves/';

var Save = function() {};
Save.write = function(dir, contents) {
  var name = slugify(dir);
  fs.write(savePath + name  + 'project.js', contents, function(err) {
    if (err) console.log(err);
  });
}

/** Returns the contents of the file in question. */
Save.read = function (dir, cb) {
  var name = slugify(dir);
  fs.readFile(savePath + name + 'project.js', function(err, data){
    if (err) console.log(err);
    cb(data);
  });
}

/** Creates the saves directory in a hidden file if it doesn't already exist. */
fs.stat(savePath, function(err, stat) {
  if (err || !stat.isDirectory()) {
    fs.mkdir(path + '/.saves/', function(err) {
      if (err) console.log(err);
    });
  }
});

/**
 * Slugify the project name
 * Check if a project of that name exits, if it doesn't create the directory for it
 * If it does exits print log it.
 */
Save.newProject = function(fileName) {
  var sluggedName = slugify(fileName);

  fs.stat(savePath + sluggedName, function(err, stat) {
    if (err) console.log(err);
    if (!stat.isDirectory()) {
      fs.mkdir(path + /.saves/ + sluggedName, function(err){
        if (err) console.log(err);
      });
    } else {
      console.log('Error, Project Already Exits');
    }
  });
}

Save.check = function(fileName) {
  var sluggedName = slugify(fileName);

  fs.stat(savePath + sluggedName, function(err, stat, cb) {
    if (err) console.log(err);
    if (stat.isDirectory()) {
      cb(true);
    } else {
      cb(false);
    }
  });
}

module.exports = Save;
