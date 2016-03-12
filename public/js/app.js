// prevent files from being dropped on the window
function preventDrag(e) {
  e.stopPropagation();
  e.preventDefault();
}

document.addEventListener('drop', preventDrag, false);
document.addEventListener('dragenter', preventDrag, false);
document.addEventListener('dragover', preventDrag, false);

(function($) {
  $('ul li').click(function(e) {
    var $this = $(this);
    $this.addClass('active');
    $this.siblings().each(function(i, e){
      $(e).removeClass('active');
    });
  });
})(jQuery);


var remote = require('remote')
var Menu = remote.require('menu')
var MenuItem = remote.require('menu-item')

// Build our new menu
var menu = new Menu()
menu.append(new MenuItem({
  label: 'Delete',
  click: function() {
    alert('Deleted')
  }
}))
menu.append(new MenuItem({
  label: 'More Info...',
  click: function() {
    alert('Here is more information')
  }
}))

// Add the listener
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.js-context-menu').addEventListener('contextmenu', function (event) {
    menu.popup(remote.getCurrentWindow());
  })
})
