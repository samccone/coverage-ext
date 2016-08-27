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

var originals = JSON.parse(dump.originals)
var sourceStore = new MemoryStore();
var collector = new Collector();

collector.add(JSON.parse(dump.coverage));

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
