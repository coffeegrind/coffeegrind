/**
 * Given an array of time ranges (in ms), folds them into windows basd on fn_window.
 * ranges - an array of objects with s and e (start and end times). See project TimeBit
 * fn_window - the hashing function to sort the times into buckets
 * interval_ms - the amount of time between ranges (used to split ranges when they overlap).
 * Note: won't work for ranges less than 1 day
 */
function fold_time_ranges(ranges, fn_window, interval_ms) {
  interval_ms = interval_ms || 86400000;
  return ranges.reduce(function(memo, curr) {
    var prev = memo[memo.length - 1];
    if (!prev) {
      memo.push([curr]);
      return memo;
    }

    // fast alternative to Math.floor
    var prevBucket = fn_window(new Date(prev[0].s));
    var currBucketEnd = fn_window(new Date(curr.e));
    if (prevBucket == currBucketEnd) {
      // append to old bucket
      prev.push(curr);
    }
    else if (fn_window(new Date(curr.s)) != currBucketEnd) {
      var d = new Date(curr.s + interval_ms);
      d.setHours(0,0,0);
      // split the range
      prev.push({s: curr.s, e: d.getTime()});
      memo.push([{s: d.getTime(), e: curr.e}]);
    }
    else {
      // create new bucket
      memo.push([curr]);
    }
    
    return memo;
  }, []);
}

// hashes for different views
var dayHash = dayHashMasterOfTheNightHash = function(d) {
  return d.getDay() + d.getMonth() * 100 + d.getYear() * 1000;
};

var weekHash = function(d) {
  return moment(d).week() + d.getYear() * 100;
};

var monthHash = function(d) {
  return d.getMonth() + d.getYear() * 100;
};

var yearHash = function(d) {
  return d.getYear();
};

/** Total time elapsed per window (in ms). */
function tte(fold_time_ranges, fn_date, fn_elapsed) {
  fn_date = fn_date || function(e) { return new Date(e); };
  fn_elapsed = fn_elapsed || function(e) { return e; };
  
  return fold_time_ranges.map(function(e) {
    var elapsed = e.reduce(function(memo, curr) {
      return (curr.e - curr.s) + memo;
    }, 0);
    
    return {
      startDate: fn_date(e[0].s, e),
      elapsedTime: fn_elapsed(elapsed),
    };
  });
}

var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
]

function formatTime(time) {
  var date = new Date(time)
  var day = date.getDate()
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return monthNames[monthIndex] + ' ' + day + ' ' + year;
}

function humanTime(ms) {
  var x = ms / 1000;
  var seconds = x % 60;
  x /= 60;
  var minutes = x % 60;
  x /= 60;
  var hours = x % 24;
  x /= 24;
  var days = x;
  
  return (days >= 1 ? Math.floor(days) + " days " : '') +
         (hours >= 1 ? Math.floor(hours) + " hours " : '') +
         (minutes >= 1 ? Math.floor(minutes) + " minutes " : '') +
         (seconds >= 1 ? Math.floor(seconds) + " seconds" : '');
}
