<list-view>
  <select onchange={ select }>
    <option value="0">Daily</option>
    <option value="1">Weekly</option>
    <option value="2">Monthly</option>
    <option value="3">Yearly</option>
  </select>
  
  <ul>
    <li each={ times }>
      <h4>{ startDate }</h4>
      <p>{ elapsedTime }</p>
    </li>
  </ul>
  
  <script>
    /**
     * The list of times spent on a project.
     */
    this.times = []
    this.project = null
    
    this.options = [
      {title: "Daily", groupBy: dayHash },
      {title: "Weekly", groupBy: weekHash },
      {title: "Monthly", groupBy: monthHash },
      {title: "Yearly", groupBy: yearHash },
    ];
    
    this.view = this.options[0]
    
    opts.on('project', function(project) {
      this.project = project
      this.update()
    }.bind(this))
    
    this.on('update', function() {
      if (!this.project) return
      var times = tte(fold_time_ranges(this.project.timeBits, this.view.groupBy))
      this.times = times.reverse()
    }.bind(this))
    
    select(e) {
      var index = $(e.target, this.root).val()
      this.view = this.options[index]
      this.update()
    }
  </script>
</list-view>