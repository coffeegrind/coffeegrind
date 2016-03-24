// prevent files from being dropped on the window
function preventDrag(e) {
  e.stopPropagation();
  e.preventDefault();
}

document.addEventListener('drop', preventDrag, false);
document.addEventListener('dragenter', preventDrag, false);
document.addEventListener('dragover', preventDrag, false);

(function($) {
  // blue highlights
  $('ul li').click(function(e) {
    var $this = $(this);
    $this.addClass('active');
    $this.siblings().each(function(i, e){
      $(e).removeClass('active');
    });
  });
  
  $(document).keydown(function(e) {
    // prevent Cmd+R reload
    /*if (e.metaKey && e.which == 82) {
      e.preventDefault();
      return false;
    }*/
  });
  
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
  
  // submit form
  $(create).submit(function(e) {
    console.log($(this).find('input').val());
    e.preventDefault();
    return false;
  });
})(jQuery);


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
  // check for valid projects
  if (!e.name) return;
  $projects.append($('<li class="list-group-item"><strong>' + e.name + '</strong><span class="time pull-right">' + e.getHumanTime() + '</span><p>Lorem ipsum dolor sit amet.</p></li>'));
});

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
