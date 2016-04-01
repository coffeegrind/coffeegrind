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
    
    this.options = [
      {title: "Daily", groupBy: dayHash, interval: 86400000 },
      {title: "Weekly", groupBy: weekHash },
      {title: "Monthly", groupBy: monthHash },
      {title: "Yearly", groupBy: yearHash },
    ];
    
    this.on('before-mount', function() {
      this.changeView(this.options[0])
      this.update()
    })
    
    select(e) {
      var index = $(e.target, this.root).val()
      this.changeView(this.options[index])
    }
    
    changeView(view) {
      // TODO: get selected project
      //this.times = tte(fold_time_ranges(controller.getProjects()[0].timeBits, view.groupBy))
    }
  </script>
</list-view>