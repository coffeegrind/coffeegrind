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
    if (typeof json !== 'object') return false;

    var object = new objectPrototype();
    for (var key in object) {
      if (typeof object[key] !== 'function') {
        object[key] = json[key];
      }
    }
    return object;
  },
};
