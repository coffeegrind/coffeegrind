// prevent files from being dropped on the window
function preventDrag(e) {
  e.stopPropagation();
  e.preventDefault();
}

document.addEventListener('drop', preventDrag, false);
document.addEventListener('dragenter', preventDrag, false);
document.addEventListener('dragover', preventDrag, false);

var $curr = false;

function init() {
  $('input').focus(function(e) {
    $curr = false;
    $('ul li').removeClass('active');
  });
  
  $(document).keydown(function(e) {
    // prevent Cmd+R reload
    /*if (e.metaKey && e.which == 82) {
      e.preventDefault();
      return false;
    }*/
    // space or enter to start stop the active project
    if ($curr && (e.which == 32 || e.which == 13)) {
      $curr.toggleClass('record', controller.toggle());
    }
    
    else if (e.which == Keyboard.keys.UP) {
      var $parent = $('ul');
      var active = $parent.find('.active').removeClass('active');
      var prev = active.prev();
      if (!prev || !prev.length) {
        prev = active.siblings(':last');
      }
      prev.addClass('active');
      //$parent.scrollTop(prev.offset().top);
    }
    else if (e.which == Keyboard.keys.DOWN) {
      var $parent = $('ul');
      var active = $parent.find('.active').removeClass('active');
      var next = active.next();
      if (!next || !next.length) {
        next = active.siblings(':first');
      }
      next.addClass('active');
      //$parent.scrollTop(next.offset().top + next.height());
    }
  });
  
  // poll for updates
  setInterval(function() {
    if (!$curr) return;
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
        console.log(n);
        var index = (n - 1 > len - 1 ? len - 1 : n - 1);
        if (index == 8) index = -1;
        console.log(index);
        var $el = $('ul li:nth(' + index + ')');
        $el.click();
        $(document.activeElement).blur();
      });
    })(i);
  }
  
  // submit form
  $(create).submit(function(e) {
    var $input = $(this).find('input');
    var val = $input.val();
    controller.use(val);
    
    var $newLi = createProjectView(controller.activeProject);
    $projects.prepend($newLi);
    $newLi.click();
    
    $input.val('').blur();
    
    e.preventDefault();
    return false;
  });
}

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

init();

// creates a single project time li
function createProjectView(project) {
  var $el = $('<li class="list-group-item" data-id="' + project.name + '"><strong>' + project.name + '</strong><span class="time pull-right">' + project.getHumanTime() + '</span></li>');
  
  // blue highlights
  $el.click(function(e) {
    var $this = $curr = $(this);
    $this.addClass('active');
    controller.use($this.attr('data-id'));
    $this.siblings().each(function(i, e){
      $(e).removeClass('active');
    });
  });
  
  return $el;
}

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
    alert('Deleted')
  }
}))

// Add the listener
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.js-context-menu').addEventListener('contextmenu', function (event) {
    menu.popup(remote.getCurrentWindow());
  })
})
