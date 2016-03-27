// prevent files from being dropped on the window
function preventDrag(e) {
  e.stopPropagation();
  e.preventDefault();
}

document.addEventListener('drop', preventDrag, false);
document.addEventListener('dragenter', preventDrag, false);
document.addEventListener('dragover', preventDrag, false);

(function init() {
  $('input').focus(function(e) {
    $('ul li').removeClass('active');
  });
  
  $(document).keydown(function(e) {
    // prevent Cmd+R reload
    /*if (e.metaKey && e.which == 82) {
      e.preventDefault();
      return false;
    }*/
    // space or enter to start stop the active project
    if (e.which == 32 || e.which == 13) {
      var $curr = $('li.active');
      if ($curr.length > 0) {
        $('ul li').removeClass('record');
        $curr.toggleClass('record', controller.toggle($curr.data('project')));
        
        // move to top
        if ($curr.hasClass('record')) {
          $curr.parent().prepend($curr);
          $curr.click();
        }
        e.preventDefault();
        return false;
      }
    }
    else if (e.which == Keyboard.keys.UP) {
      var $parent = $('ul');
      var active = $parent.find('.active').removeClass('active');
      var prev = active.prev();
      if (!prev || !prev.length) {
        prev = active.siblings(':last');
      }
      prev.click();
    }
    else if (e.which == Keyboard.keys.DOWN) {
      var $parent = $('ul');
      var active = $parent.find('.active').removeClass('active');
      var next = active.next();
      if (!next || !next.length) {
        next = active.siblings(':first');
      }
      next.click();
    }
  });
  
  // poll for updates
  setInterval(function() {
    var $curr = $('li.record');
    if (!$curr.length > 0 || !controller.activeProject) return;
    $curr.find('.time').text(controller.activeProject.getHumanTime());
  }, 500);
  
  // on-page keyboard shortcuts
  var Keyboard = require('./js/keyboard');
  Keyboard.focusable(create_input, 'Meta+C', 'Meta+C');
  //Keyboard.focusable(create_input, 'Meta+N', 'Meta+N');
  
  // number keys 1-9 focus elements in list
  for (var i=1; i < 10; i++) {
    (function(n) {
      Keyboard.on(create, 'Meta+' + n, function() {
        var len = $('ul li').length;
        var index = (n - 1 > len - 1 ? len - 1 : n - 1);
        if (index == 8) index = -1;
        var $el = $('ul li:nth(' + index + ')');
        $el.click();
        $(document.activeElement).blur();
      });
    })(i);
  }
  
  // submit create project form
  $(create).submit(function(e) {
    var $input = $(this).find('input');
    var val = $input.val();
    
    var project = controller.use(val);
    if (!project) {
      e.preventDefault();
      return false;
    }
    var $newLi = createProjectView(project);
    
    // check for existing element
    var $existing = $projects.find('li[data-id="' + $newLi.attr('data-id') + '"]');
    if ($existing.length > 0) {
      $newLi = $existing;
    }
    
    // add new element
    $projects.prepend($newLi);
    $newLi.click();
    
    // clear input
    $input.val('').blur();
    
    e.preventDefault();
    return false;
  });
})();

var remote = require('remote')
var app = remote.app;
var Menu = remote.require('menu')
var MenuItem = remote.require('menu-item')

// menu events
app.on('new-project', function(item) {
  $(create_input).focus();
});

// saving/loading projects
const storage = remote.require('node-persist');
const ProjectController = remote.require('./lib/controller');
const controller = ProjectController.getInstance();

var $projects = $(projects);
controller.getProjects().forEach(function(e, i) {
  $projects.append(createProjectView(e));
});

// listen for server events
controller.on('start', function(project) {
  var $el = $projects.find('li[data-id="' + project.id +'"]');
  $el.addClass('record');
});

controller.on('stop', function(project) {
  var $el = $projects.find('li[data-id="' + project.id +'"]');
  $el.removeClass('record');
})

// creates a single project time li
function createProjectView(project) {
  var $el = $('<li class="list-group-item" data-id="' + project.id + '"><strong>' + project.name + '</strong><span class="time pull-right">' + project.getHumanTime() + '</span></li>');
  
  $el.data('project', project);
  
  $el.click(function(e) {
    var $this = $(this);
    
    // double clicking
    if (e.originalEvent) {
      var lastClicked = $this.data('lastClicked');
      var now = new Date();
      if (lastClicked) {
        var DOUBLE_CLICK_TIME = 600;
        if (now.getTime() - lastClicked.getTime() < DOUBLE_CLICK_TIME) {
          $this.data('lastClicked', false);
          console.log('hey! you clicked me twice');
        }
      }
      else {
        $this.data('lastClicked', now);
      }
    }
    
    // highlight me
    $this.addClass('active');
    $this.siblings().each(function(i, e){
      $(e).removeClass('active');
    });
    
    // scroll to make sure element stays visible
    var $container = $this.parent().parent();
    var top = $this.offset().top;
    if (top > $container.height() || top < 0) {
      $container.scrollTop(top);
    }
  });
  
  return $el;
}

var menuTarget;
var menuProject;
// Build our new menu
var menu = new Menu()
menu.append(new MenuItem({
  label: 'More Info...',
  click: function() {
    var project = menuProject;
    alert(project.name + 
          '\nDate Created: ' + formatTime(project.dateCreated) +
          '\nProject Directory: ' + (project.directory ? project.directory : 'Not Set')
    );
  }
}))
menu.append(new MenuItem({
  label: 'Open Project Directory',
  click: function() {
    const shell = remote.require('electron').shell;
    var dir = menuProject.directory;
    if (dir) shell.showItemInFolder(dir);
    else alert('Project directory not set.');
  }
}))
menu.append(new MenuItem({
  label: 'Set Project Directory',
  click: function() {
    const dialog = remote.require('electron').dialog;
    var project = menuProject;
    var userSelection = dialog.showOpenDialog({properties: ['openDirectory']});
    project.setProjectDirectory(userSelection[0]);
    controller.save(project);
  }
}))
menu.append(new MenuItem({
  label: 'Delete',
  click: function() {
    var project = menuProject;
    if (confirm('Really delete ' + project.name + '? \nThis action cannnot be undone.')) {
      controller.delete(project);
      $(menuTarget).remove();
    }
  }
}))

// Add the listener
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.js-context-menu').addEventListener('contextmenu', function (event) {
    menuTarget = event.target;
    menuProject = $(menuTarget).data('project');
    menu.popup(remote.getCurrentWindow());
  })
})

var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];

function formatTime(time) {
  var date = new Date(time);
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  
  return monthNames[monthIndex] + ' ' + day + ' ' + year;
}
