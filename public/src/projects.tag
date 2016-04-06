<projects>
  <ul class="list-group">
    <div class="list-group-header">
      <form id="create" class="form-inline" onsubmit={ createProject }>
        <button class="btn btn-primary pull-right"><i class="icon icon-plus"></i></button>
        <input id="create_input" class="form-control" type="text" placeholder="Create a new project">
      </form>
    </div>
  </ul>
  <ul class="projects list-group" oncontextmenu={ rightClick }>
    <li each={ this.projects } no-reorder class="list-group-item { active: parent.selected.id == this.id } { record: this.record }" onclick={ parent.clickProject } ondblclick={ parent.renameProject }>
      <strong>{ name }</strong>
      <span class="time pull-right">{ time || getHumanTime() }</span>
      <p>{ note }</p>
    </li>
  </ul>
  
  <script>
    /**
     * List of projects.
     */
    const ProjectController = remote.require('./lib/controller')
    const controller = ProjectController.getInstance()
    
    this.projects = controller.getProjects()
    this.selected = this.projects[0]
    this.current = false
    this.on('before-mount', function() {
      this.clickProject({item: this.selected})
    })
    
    // poll for updates
    var poll = setInterval(function() {
      if (!controller.started) return
      
      var time = controller.activeProject.getHumanTime()
      if (this.current.time != time) {
        this.current.time = time
        this.update()
      }
    }.bind(this), 5000)
    
    this.on('unmount', function() {
      clearInterval(poll)
    })
    
    clickProject(e) {
      // unselect old project
      if (this.selected != e.item) {
        var index = this.projectIndex(this.selected)
        $('ul li:nth(' + index + ')', this.root).removeClass('active')
      }
      
      this.selected = e.item
      opts.trigger('project', this.selected)
      if (!controller.started) this.useProject(this.selected)
      remote.getCurrentWindow().setTitle(this.selected.name + ' — CoffeeGrind')
      if (e.target) scrollToVisible($(e.target), 3)
    }
    
    /** Programatically click a project at the given index. */
    clickProjectIndex(index) {
      var $el = $('ul li:nth(' + index + ')', this.root)
      this.clickProject({
        item: this.projects[index],
        target: $el
      })
      return $el
    }
    
    createProject(e) {
      var $input = $(e.target).find('input')
      var val = $input.val()
      this.selected = this.useProject(val)
      
      // clear input
      $input.val('').blur()
    }
    
    useProject(val) {
      var project = controller.use(val)
      if (!project) return false
      // set the project to our current project index (to sync ui)
      var index;
      if ((index = this.projectIndex(project)) >= 0) project = this.projects[index]
      else this.projects.unshift(project)
      
      return this.current = project
    }
    
    /** Scroll parent to make sure element stays visible. */
    function scrollToVisible($element, parentLevel) {
      parentLevel = parentLevel || 1
      var $container = $element
      while (parentLevel-- > 0) $container = $container.parent()
      var top = $element.offset().top
      if (top > $container.height() || top < 0) {
        $container.scrollTop(top)
      }
    }
    
    /** indexOf replacement because projects aren't equal to the backend. */
    this.projectIndex = function(project) {
      var id = project.id
      for (var i=0, n=this.projects.length; i<n; i++) {
        if (this.projects[i].id == id) return i
      }
      return -1
    }
    
    // listen for server events
    const ipcRenderer = require('electron').ipcRenderer
    ipcRenderer.on('start', function(event, arg) {
      this.current.record = true
      this.update()
    }.bind(this))

    ipcRenderer.on('stop', function(event, arg) {
      this.current.record = false
      opts.trigger('project', this.current)
      this.update()
    }.bind(this))
    
    ipcRenderer.on('project-new', function(event, arg) {
      $('#create_input').focus()
    }.bind(this))
    
    ipcRenderer.on('project-rename', function(event, arg) {
      var $el = $('ul li.active', this.root);
      this.renameProject({target: $el})
    }.bind(this))
    
    // on-page keyboard shortcuts
    var Keyboard = require('./js/keyboard');
    
    $(document).keydown(function(e) {
      // start/stop the active project
      if (e.which == 13 /* enter */) {
        if (document.activeElement.tagName == 'INPUT') return
        this.current.record = controller.toggle()
        if (!this.current.record) opts.trigger('project', this.current)
        this.update()
      }
      else if (e.which == Keyboard.keys.UP) {
        var index = $('ul li.active', this.root).removeClass('active').index()
        if (--index < 0) index = this.projects.length - 1
        this.clickProjectIndex(index).addClass('active')
      }
      else if (e.which == Keyboard.keys.DOWN) {
        var index = $('ul li.active', this.root).removeClass('active').index()
        if (++index > this.projects.length - 1) index = 0
        this.clickProjectIndex(index).addClass('active')
      }
      else if (e.which == 27 /* escape */) {
        $(document.activeElement).blur()
      }
    }.bind(this))

    // number keys 1-9 focus elements in list
    for (var i=1; i < 10; i++) {
      (function(n) {
        Keyboard.on($('#create'), 'Meta+' + n, function() {
          var len = this.projects.length
          var index = n - 1 > len - 1 ? len - 1 : n - 1
          if (index == 8) index = len - 1
          
          // manually update the ui #perfmatters
          $('ul li', this.root).removeClass('active')
          
          this.clickProjectIndex(index).addClass('active')
          $(document.activeElement).blur()
        }.bind(this))
      }.bind(this))(i)
    }
    
    // right-click menu
    var menuTarget
    var menuProject
    var menu = new Menu()
    menu.append(new MenuItem({
      label: 'More Info...',
      click: function() {
        var project = menuProject
        alert(project.name + 
              '\nDate Created: ' + formatTime(project.dateCreated) +
              '\nProject Directory: ' + (project.directory ? project.directory : 'Not Set')
        )
      }
    }))
    menu.append(new MenuItem({
      label: 'Open Project Directory',
      click: function() {
        const shell = remote.require('electron').shell
        var dir = menuProject.directory
        if (dir) shell.showItemInFolder(dir)
        else alert('Project directory not set.')
      }
    }))
    menu.append(new MenuItem({
      label: 'Set Project Directory',
      click: function() {
        const dialog = remote.require('electron').dialog
        var project = menuProject
        var userSelection = dialog.showOpenDialog({properties: ['openDirectory']})
        project.setProjectDirectory(userSelection[0])
        controller.save(project)
      }
    }))
    menu.append(new MenuItem({
      label: 'Delete',
      click: function() {
        var project = menuProject
        if (confirm('Really delete ' + project.name + '? \nThis action cannnot be undone.')) {
          controller.delete(project)
          // TODO: remove from projects?
          menuTarget.remove()
        }
      }
    }))
    
    rightClick(e) {
      menuTarget = $(e.target)
      menuProject = this.projects[menuTarget.index()]
      menu.popup(remote.getCurrentWindow())
    }
    
    var editing = false
    renameProject(e) {
      if (editing) return
      editing = true
      var $parent = $(e.target).closest('li')
      var $editable = $parent.find('strong')
      var oVal = $editable.text()
      $parent.addClass('rename')
      $editable.text('')
      var self = this
      
      $('<input type="text">').val(oVal).appendTo($parent).focus()
        .css('line-height', $editable.height())
        .on('focusout keydown', function(e) {
          if (e.type == 'keydown' && !(e.which == 13 || e.which == 27)) return
          
          var $this = $(this)
          var val = $this.val().trim() || oVal
          $editable.text(val)
          $this.remove()
          $parent.removeClass('rename')
          editing = false
          
          if (val.length > 0) {
            // rename project
            var project = self.projects[$parent.index()]
            project.name = val
            controller.save(project)
            remote.getCurrentWindow().setTitle(self.selected.name + ' — CoffeeGrind')
          }
          
          e.stopPropagation()
        })
    }
  </script>
</projects>