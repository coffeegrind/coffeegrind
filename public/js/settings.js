(function ($) {
  /** Adds classes and removes them after animations complete. */
  $.fn.hotClass = function (classList, callback) {
      this.addClass(classList);
      var onAnimationEnd = function ($this) {
          return function (e) {
              $this.removeClass(classList);
              if (callback) callback(e);
          };
      };
      this.one('webkitAnimationEnd oAnimationEnd msAnimationEnd animationend', onAnimationEnd(this));
  };
}(jQuery));

const remote = require('remote');
const globalShortcut = remote.globalShortcut;
setTimeout(function() {
  menu = require('../lib/menu');
}, 0);

var IS_MAC = remote.process.platform === 'darwin';
var CMD_OR_CTRL = IS_MAC ? '\u2318' : '\u2303';
var meta = IS_MAC ? 'Cmd' : 'Super';

var DISPLAY_MAP = {
  'Command': '\u2318',
  'Cmd': '\u2318',
  'CommandOrControl': CMD_OR_CTRL,
  'CmdOrCtrl': CMD_OR_CTRL,
  'Super': '\u2318',
  'Control': '\u2303',
  'Ctrl': '\u2303',
  'Shift': '\u21e7',
  'Alt': '\u2325',
  'Plus': '='
};

/** Formats the key command for display purposes. */
function formatAccelerator(accelerator) {
  if (!accelerator) return '';

  return accelerator
    .split('+')
    .map(function(modifierOrKeyCode) {
      return DISPLAY_MAP[modifierOrKeyCode] || modifierOrKeyCode;
    })
    .join('');
};

// special keys
var MAP = {
  8: 'Backspace', 9: 'Tab', 12: 'Clear',
  13: 'Enter', 27: 'Esc', 32: 'Space',
  33: 'PageUp', 34: 'PageDown', 35: 'End', 36: 'Home',
  37: 'Left', 38: 'Up', 39: 'Right', 40: 'Down',
  46: 'Delete', 186: ';', 187: '=', 188: ',',
  189: '-', 190: '.', 191: '/', 192: '`',
  219: '[', 220: '\\', 221: ']', 222: "'"
};
// F1 to F24
for(k=1;k<25;k++) MAP[111+k] = 'F'+k;

// load current config
const config = remote.require('./lib/config');

var originals = {};
config.keys().forEach(function(key) {
  var val = config.get(key);
  originals[key] = val;
  if (key.indexOf('cmd') == 0) val = formatAccelerator(val);
  $('[name="' + key + '"]').val(val);
});

/**
 * As of 0.36.7 electron accelerator supports:
 * http://electron.atom.io/docs/v0.36.7/api/accelerator/
 */
$('.shortcuts input').keydown(function(e) {
  var $this = $(this);
  
  var key = MAP[e.which] || String.fromCharCode(e.which);
  var save = true;
  
  // display only, don't set key command
  // Shift, Ctrl, Alt, Cmd (left), Cmd (right)
  if ((e.which >= 16 && e.which <= 18) || e.which == 91 || e.which == 93) {
    key = '';
    save = false;
  }
  
  var cmdStr = (e.ctrlKey ? 'Ctrl+' : '') +
               (e.altKey ? 'Alt+' : '') +
               (e.shiftKey ? 'Shift+' : '') +
               (e.metaKey ? meta+'+' : '') +
               key;
  
  $this.val( formatAccelerator(cmdStr) );
  
  if (save) {
    var oldCmd = $this.attr('data-cmd');
    
    if (config.set($this.attr('name'), cmdStr)) {
      $this.addClass('success');
      $this.attr('data-cmd', cmdStr);
    }
    else {
      $this.hotClass('animated shake');
      $this.val( formatAccelerator(oldCmd) );
    }
  }
  
  return false;
});

$('select').change(function(e) {
  console.log($(this).attr('name'));
  config.set($(this).attr('name'), $(this).val());
});

$(cancel).click(function(e) {
  // restore original values
  config.keys().forEach(function(key) {
    config.set(key, originals[key]);
  });

  window.close();

  e.stopPropagation();
  return false;
});

// save user settings
$(settings).submit(function(e) {
  window.close();
  e.preventDefault();
  return false;
});
