<list-view>
  <select onchange={ select } class="form-control">
    <option value="0">Daily</option>
    <option value="1">Weekly</option>
    <option value="2">Monthly</option>
    <option value="3">Yearly</option>
  </select>
  
  <ul>
    <li each={ times } no-reorder>
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
      {title: 'Daily', dateFormat: days, groupBy: dayHash },
      {title: 'Weekly', dateFormat: weeks, groupBy: weekHash },
      {title: 'Monthly', dateFormat: months, groupBy: monthHash },
      {title: 'Yearly', dateFormat: years, groupBy: yearHash },
    ];
    
    this.view = this.options[0]
    
    opts.on('project', function(project) {
      this.project = project
      this.update()
    }.bind(this))
    
    this.on('update', function() {
      if (!this.project) return
      
      var ranges = fold_time_ranges(this.project.timeBits, this.view.groupBy)
      console.log(g = ranges)
      var times = tte(ranges, this.view.dateFormat, humanTime)
      this.times = times.reverse()
    }.bind(this))
    
    select(e) {
      var index = $(e.target, this.root).val()
      this.view = this.options[index]
    }
    
    function days(ms) {
      if (moment().startOf('week').isBefore(ms)) {
        return moment(ms).calendar().split('at')[0].split('Last').pop().trim()
      }
      return moment(ms).calendar().split('at')[0].trim()
    }
    
    function weeks(ms) {
      var thisWeek = weekHash(new Date())
      var lastWeek = weekHash(moment().weekday(-7).toDate())
      var hash = weekHash(new Date(ms))
      if (hash == thisWeek) {
        return 'This Week'
      }
      else if (hash == lastWeek) {
        return 'Last Week'
      }
      return moment(ms).startOf('week').calendar()
    }
    
    function months(ms) {
      var date = new Date(ms)
      if (monthHash(date) == monthHash(new Date())) {
        return 'This Month'
      }
      return monthNames[date.getMonth()] + ' ' + date.getFullYear()
    }
    
    function years(ms) {
      var date = new Date(ms)
      if (yearHash(date) == yearHash(new Date())) {
        return 'This Year'
      }
      return date.getFullYear()
    }
  </script>
</list-view>