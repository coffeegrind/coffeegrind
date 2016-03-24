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
        $curr.toggleClass('record', controller.toggle());
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
    var $curr = $('li.active');
    if (!$curr.length > 0 || !controller.activeProject) return;
    $curr.find('.time').text(controller.activeProject.getHumanTime());
  }, 500);
  
  // on-page keyboard shortcuts
  var Keyboard = require('./js/keyboard');
  Keyboard.focusable(create_input, 'Meta+C', 'Meta+C');
  Keyboard.focusable(create_input, 'Meta+N', 'Meta+N');
  
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
    controller.use(val);
    
    var $newLi = createProjectView(controller.activeProject);
    
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
var Menu = remote.require('menu')
var MenuItem = remote.require('menu-item')

// saving/loading projects
const storage = remote.require('node-persist');
const ProjectController = remote.require('./lib/controller');
storage.initSync({dir: __dirname + '/../persist/projects'});
const controller = new ProjectController(storage);

var $projects = $(projects);
controller.getProjects().forEach(function(e, i) {
  $projects.append(createProjectView(e));
});

// creates a single project time li
function createProjectView(project) {
  var $el = $('<li class="list-group-item" data-id="' + project.name + '"><strong>' + project.name + '</strong><span class="time pull-right">' + project.getHumanTime() + '</span></li>');
  
  // blue highlights
  $el.click(function(e) {
    var $this = $(this);
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
// Build our new menu
var menu = new Menu()
menu.append(new MenuItem({
  label: 'More Info...',
  click: function() {
    alert('Here is more information')
  }
}))
menu.append(new MenuItem({
  label: 'Delete',
  click: function() {
    alert('Deleted ' + menuTarget)
  }
}))
menu.append(new MenuItem({
  label: 'Add Home Directory',
  click: function() {
    const dialog = remote.require('electron').dialog;
    console.log(dialog.showOpenDialog({properties: ['openDirectory']}));
  }
}))

// Add the listener
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.js-context-menu').addEventListener('contextmenu', function (event) {
    menuTarget = event.target;
    menu.popup(remote.getCurrentWindow());
  })
})
