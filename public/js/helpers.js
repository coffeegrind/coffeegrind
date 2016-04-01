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
  return d.getDay() + d.getMonth() * 10 + d.getYear() * 1000;
};

var weekHash = function(d) {
  d.setHours(0,0,0);
  d.setDate(d.getDate()+4-(d.getDay()||7));
  var weekNum = Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
  return weekNum + d.getYear() * 100;
};

var monthHash = function(d) {
  return d.getMonth() + d.getYear() * 100;
};

var yearHash = function(d) {
  return d.getYear();
};

/** Total time elapsed per window (in ms). */
function tte(fold_time_ranges, offset) {
  offset = offset || 0;
  return fold_time_ranges.map(function(e) {
    var elapsed = e.reduce(function(memo, curr) {
      return (curr.e - curr.s) + memo;
    }, 0);
    
    //var startTime = ((e[0].s / window_ms) >> 0) * window_ms;
    return {
      startDate: new Date(e[0].s),
      elapsedTime: elapsed,
    };
  });
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
