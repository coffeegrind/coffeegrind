module.exports = {

  slugify: function(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  },

  /** Parses the string data and returns a new copy of object or false if parsing fails. */
  parseObject: function(objectPrototype, json) {
    if (!json) return new objectPrototype();
    if (typeof json !== 'object') return false;

    var object = new objectPrototype();
    for (var key in object) {
      if (typeof object[key] !== 'function' && typeof json[key] !== 'undefined') {
        object[key] = json[key];
      }
    }
    return object;
  },

  /** Checks if two arrays have the same elements, independent of order. */
  arraysEqual: function(arr1, arr2) {
    if (arr1.length != arr2.length) return false;
    
    // array intersection
    var intersection = arr1.filter(function(n) {
      return arr2.indexOf(n) != -1;
    });
    return intersection.length == arr1.length;
  }

};
