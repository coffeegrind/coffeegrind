/**
 * Keyboard Input
 * Nice to have: dd to delete current search, more vim goodness
 * Ctrl+Delete for delete last word
 */
var Keyboard = (function() {
  'use strict';
  
  // empty constructor
  function Keyboard() {
  };
  
  var keys = {
    FORWARD_SLASH: 191,
    ESCAPE: 27,
    ESC: 27,
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    ENTER: 13,
    DELETE: 46,
  };
  
  Keyboard.keys = keys;
  
  /**
   * Represents a key + some modifier(s)
   * TODO: add ability to listen for key combinations (think: vim)
   */
  function Cmd(code, modifiers) {
    this.code = code;
    this.modifiers = modifiers || [];
    
    /** returns true if this key is pressed in the event */
    this.isPressed = function(e) {
      var mods = this.modifiers;
      for (var i=0,n=mods.length; i<n; i++) {
        if (!e[mods[i]]) return false;
      } 
      
      return (e.which == this.code);
    };
    
    /** returns the jQuery event for this Cmd. */
    this.event = function() {
      var e = {};
      e.which = this.code;
      for (var i=0,n=this.modifiers.length; i<n; i++) {
        e[this.modifiers[i]] = true;
      }
      console.log(e)
      return $.Event('keydown', e);
    };
  };
  
  /** Creates a new Cmd from a string or integer. */
  Cmd.parse = function(str) {
    var keyCode = str, modifiers;
    
    if (typeof keyCode === 'string') {
      var parts = str.split('+');
      keyCode = parts.pop();
      // Ctrl+1 is really Ctrl+49... TODO: distinguish between Ctrl+1 key and Ctrl+1 code
      if (keyCode.length > 1) keyCode = parseInt(keyCode);
      else keyCode = keyCode.charCodeAt(0);
      modifiers = parts.map(function(e) { return e.toLowerCase() + 'Key'; });
    }
    
    return new Cmd(keyCode, modifiers);
  };
  
  // static methods
  
  /**
   * Allows the jQuery selector/element to be focused with key and
   * blurred with escape.
   * Default keys: Forward Slash, Escape
   * TODO: accept arrays of keys, check all modifiers for each key
   */
  Keyboard.focusable = function($element, focusKey, blurKey)
  {
    focusKey = Cmd.parse(focusKey || keys.FORWARD_SLASH);
    blurKey = Cmd.parse(blurKey || keys.ESCAPE);
    
    $element = $($element);
    $(document).keydown(function(e) {
      if (!$element.is(':focus') && focusKey.isPressed(e)) {
        $element.focus();
        return false; // consume event
      }
      else if (blurKey.isPressed(e)) {
        $element.blur();
      }
    });
  };
  
  Keyboard.on = function($element, key, callback) {
    key = Cmd.parse(key);
    $element = $($element);
    
    $(document).keydown(function(e) {
      if (!key.isPressed(e)) return;
      if (!callback()) return false;
    });
  };
  
  // jQuery plugin
  (function($) {
    $.fn.keyFocusable = function(focusKey, blurKey) {
      Keyboard.focusable(this, focusKey, blurKey);
    };
    
    $.fn.remapKeys = function(keymap) {
      Keyboard.remap(this, keymap);
    };
  })(jQuery);
  
  /**
   * Given a map of Cmd : jQuery Event, triggers the event when Cmd is detected.
   */
  Keyboard.remap = function(selector, keymap) {
    // convert to map to commands
    keymap = Object.keys(keymap).map(function(key){
      var e = keymap[key];
      e = typeof e === 'string' ? Cmd.parse(e) : e;
      var event = typeof e === 'object' ? e : $.Event('keydown', {which: e});
      return [Cmd.parse(key), event];
    });
    
    $(selector).keydown(function(e) {
      for (var i=0,n=keymap.length; i<n; i++) {
        var map = keymap[i];
        var cmd = map[0];
        var event = map[1];
        
        if (cmd.isPressed(e)) $(this).trigger(event);
      }
    })
  };
  
  /**
   * Remaps Ctrl+HJKL to vim-styled simulated arrow keys.
   * For a more robust solution: https://github.com/dwachss/bililiteRange
   * Or https://github.com/thoughtbot/vimulator
   */
  Keyboard.remapArrowKeys = function(selector, keymap)
  {
    selector = selector || document;
    keymap = keymap || {'Ctrl+H': keys.LEFT, 'Ctrl+J': keys.DOWN, 'Ctrl+K': keys.UP, 'Ctrl+L':  keys.RIGHT};
    
    // convert to keymap to commands
    keymap = Object.keys(keymap).map(function(key){ var e = keymap[key]; return [Cmd.parse(key), e]; });
    
    $(selector).keydown(function(e) {
      var $element = $(e.target);

      var el, key, sim;
      for (var i=0,n=keymap.length; i<n; i++) {
        el = keymap[i];
        key = el[0];
        
        if (!key.isPressed(e)) continue;
        
        sim = el[1];

        // move left and right
        if (sim == keys.LEFT) {
          var startIndex = $element.prop('selectionStart');
          if (e.shiftKey) {
            $element.prop('selectionStart', 0);
            $element.prop('selectionEnd', startIndex);
          }
          else {
            $element.prop('selectionStart', startIndex - 1);
            $element.prop('selectionEnd', startIndex - 1);
          }
        }
        else if (sim == keys.RIGHT) {
          var endIndex = $element.prop('selectionEnd');
          if (e.shiftKey) {
            $element.prop('selectionStart', endIndex);
            $element.prop('selectionEnd', 9999999);
          }
          else {
            $element.prop('selectionStart', endIndex + 1);
            $element.prop('selectionEnd', endIndex + 1);
          }
        }
        else if (sim == keys.UP) {
          var active = $element.parent().find('.tt-cursor').removeClass('tt-cursor');
          var prev = active.prev();
          if (!prev || !prev.length) {
            prev = active.siblings(':last');
          }
          prev.addClass('tt-cursor');
        }
        else if (sim == keys.DOWN) {
          var active = $element.parent().find('.tt-cursor').removeClass('tt-cursor');
          var next = active.next();
          if (!next || !next.length) {
            next = active.siblings(':first');
          }
          next.addClass('tt-cursor');
        }

        return false;
      }
    });
  };
  
  return Keyboard;
  
})();

module.exports = Keyboard;