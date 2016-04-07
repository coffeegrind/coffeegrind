<settings>
  <form onsubmit={ submit } class="settings">
    
    <div class="form-group">
      <h4>Idle Detection</h4>
      <p class="info">Auto start and stop the timer after:</p>
      <select onchange={ change } name="idleTime" class="form-control">
        <option value="-1">Sleep Only</option>
        <option value="60000">1 Minute</option>
        <option value="120000">2 Minutes</option>
        <option value="300000">5 Minutes</option>
        <option value="600000">10 Minutes</option>
        <option value="900000">15 Minutes</option>
        <option value="1200000">30 Minutes</option>
      </select>
    </div>
    
    <div class="shortcuts form-group">
      <h4>Keyboard Shortcuts</h4>
      <table>
        <tr>
          <td>Toggle Window:</td>
          <td><input onkeydown={ keydown } onblur={ blur } name="cmdWindow" class="form-control"></td>
        </tr>
        <tr>
          <td>Start/Stop Timer:</td>
          <td><input onkeydown={ keydown } onblur={ blur } name="cmdTimer" class="form-control"></td>
        </tr>
      </table>
    </div>
    
    <div class="form-actions">
      <input onclick={ cancel } type="submit" class="btn btn-form btn-default" value="Cancel" />
      <input type="submit" class="btn btn-form btn-primary" value="Save" />
    </div>
    
  </form>
  
  <script>
    /**
     * Settings page.
     */
    const globalShortcut = remote.globalShortcut

    var IS_MAC = remote.process.platform === 'darwin'
    var CMD_OR_CTRL = IS_MAC ? '\u2318' : '\u2303'
    var meta = IS_MAC ? 'Cmd' : 'Super'

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
    }

    /** Formats the key command for display purposes. */
    function formatAccelerator(accelerator) {
      if (!accelerator) return ''

      return accelerator
        .split('+')
        .map(function(modifierOrKeyCode) {
          return DISPLAY_MAP[modifierOrKeyCode] || modifierOrKeyCode
        })
        .join('')
    }

    // special keys
    var MAP = {
      8: 'Backspace', 9: 'Tab', 12: 'Clear',
      13: 'Enter', 27: 'Esc', 32: 'Space',
      33: 'PageUp', 34: 'PageDown', 35: 'End', 36: 'Home',
      37: 'Left', 38: 'Up', 39: 'Right', 40: 'Down',
      46: 'Delete', 186: ';', 187: '=', 188: ',',
      189: '-', 190: '.', 191: '/', 192: '`',
      219: '[', 220: '\\', 221: ']', 222: "'"
    }
    // F1 to F24
    for(k=1;k<25;k++) MAP[111+k] = 'F'+k

    // load current config
    const config = remote.require('./lib/config')
    var originals = {}
    
    this.on('mount', function() {
      setTimeout(function(){$(this.root).addClass('active')}.bind(this), 0)
      
      config.keys().forEach(function(key) {
        var val = config.get(key)
        originals[key] = val
        var $el = $('[name="' + key + '"]')
        if (key.indexOf('cmd') == 0) {
          $el.attr('data-cmd', val)
          val = formatAccelerator(val)
        }
        $el.val(val)
      })
      
      $(document).onFirst('keydown.settings', function(e) {
        if (e.which == 27 /* esc */) {
          if (document.activeElement.tagName == 'INPUT') return
          this.cancel()
        }
        else if (e.which == 13 /* enter */) {
          this.submit()
          e.stopImmediatePropagation()
        }
      }.bind(this))
      
      this.title = remote.getCurrentWindow().getTitle()
      remote.getCurrentWindow().setTitle('Settings')
    })
    
    this.on('before-unmount', function() {
      $(document).off('keydown.settings')
    })

    /**
     * As of 0.36.7 electron accelerator supports:
     * http://electron.atom.io/docs/v0.36.7/api/accelerator/
     */
    keydown(e) {
      var $this = $(e.target, this.root)

      var key = MAP[e.which] || String.fromCharCode(e.which)
      var save = true

      // display only, don't set key command
      // Shift, Ctrl, Alt, Cmd (left), Cmd (right)
      if ((e.which >= 16 && e.which <= 18) || e.which == 91 || e.which == 93) {
        key = ''
        save = false
      }
      
      // allow inputs to be tabbed over
      if (!e.metaKey && !e.ctrlKey && !e.altKey && e.which == 9 /* tab */) return true

      var cmdStr = (e.ctrlKey ? 'Ctrl+' : '') +
                   (e.altKey ? 'Alt+' : '') +
                   (e.shiftKey ? 'Shift+' : '') +
                   (e.metaKey ? meta+'+' : '') +
                   key

      $this.val( formatAccelerator(cmdStr) )

      if (save) {
        var oldCmd = $this.attr('data-cmd')

        if (config.set($this.attr('name'), cmdStr)) {
          $this.addClass('success')
          $this.attr('data-cmd', cmdStr)
        }
        else {
          $this.hotClass('animated shake')
          $this.val( formatAccelerator(oldCmd) )
        }
      }

      e.stopPropagation()
    }
    
    blur(e) {
      var $this = $(e.target, this.root)
      var oldCmd = $this.attr('data-cmd')
      $this.val( formatAccelerator(oldCmd) )
    }

    change(e) {
      var $this = $(e.target, this.root)
      config.set($this.attr('name'), $this.val())
    }
    
    /** Like unmount, but waits for the animation to complete. */
    close() {
      $(this.root).removeClass('active')
      remote.getCurrentWindow().setTitle(this.title)
      setTimeout(function() {
        this.unmount()
      }.bind(this), 100)
    }

    cancel() {
      // restore original values
      config.keys().forEach(function(key) {
        config.set(key, originals[key])
      })

      this.close()
    }

    // save user settings
    submit() {
      ipcRenderer.send('reloadConfig')
      this.close()
    }

  </script>
</settings>