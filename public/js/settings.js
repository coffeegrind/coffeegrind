window.$ = window.jQuery = require('./js/jquery.min');

var remote = require('remote');

var IS_MAC = remote.process.platform === 'darwin';
var CMD_OR_CTRL = IS_MAC ? '\u2318' : '\u2303';
var meta = IS_MAC ? 'Cmd' : 'Super';

var MODIFIER_MAP = {
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

function formatAccelerator (accelerator) {
  if (!accelerator) return '';

  return accelerator
    .split('+')
    .map(function(modifierOrKeyCode) {
      return MODIFIER_MAP[modifierOrKeyCode] || modifierOrKeyCode;
    })
    .join('');
};

$(settings).submit(function(e) {
  e.preventDefault();
  return false;
});

$('.shortcuts input').keydown(function(e) {
  var $this = $(this);
  
  console.log(e);
  var cmdStr = (e.metaKey ? meta+'+' : '') +
               (e.ctrlKey ? 'Ctrl+' : '') +
               (e.shiftKey ? 'Shift+' : '') +
               (e.altKey ? 'Alt+' : '') +
               String.fromCharCode(e.which);
  $this.val(formatAccelerator(cmdStr));
  
  return false;
});