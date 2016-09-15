var ISTANBUL_PATH = 'node_modules/istanbul';

var path = require('path');
var fs = require('fs');

var MemoryStore = require('./' + path.join(
  ISTANBUL_PATH, '/lib/store/memory'));

var HtmlReporter = require('./' + path.join(
  ISTANBUL_PATH, '/lib/report/html'));

var Collector = require('./' + path.join(
  ISTANBUL_PATH, '/lib/collector'));

var dump = JSON.parse(
  fs.readFileSync(
    path.resolve(process.cwd(), process.argv[2]), 'utf8'));

var truncateFileNames = function (data) {
    return Object.keys(data).reduce(function (n, path) {
        n[path.slice(0, 200)] = data[path];
        n[path.slice(0, 200)].path = path.slice(0, 200)

        return n;
    }, {});
}

var originals = truncateFileNames(JSON.parse(dump.originals));
var sourceStore = new MemoryStore();
var collector = new Collector();
var data = truncateFileNames(JSON.parse(dump.coverage));

collector.add(data);

function atob(str) {
  return new Buffer(str, 'base64').toString('binary');
}

Object.keys(originals).forEach(key => {
  sourceStore.set(key,
    decodeURIComponent(
      escape(atob(originals[key]))));
});


var reporter = new HtmlReporter({
  verbose: true,
  sourceStore,
  collector,
});

reporter.writeReport(collector, true);
