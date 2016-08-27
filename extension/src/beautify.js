window.beautify = function(src) {
  var b = require('js-beautify').js_beautify;

  return b(src, {indent_size: 2});
}
