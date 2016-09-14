var ISTANBUL_PATH = 'node_modules/istanbul';

var path = require('path');
var fs = require('fs');

var MemoryStore = require('./' + path.join(
  ISTANBUL_PATH, '/lib/store/memory'));

var HtmlReporter = require('./' + path.join(
  ISTANBUL_PATH, '/lib/report/html'));

var Collector = require('./' + path.join(
  ISTANBUL_PATH, '/lib/collector'));

var FileWriter = require('./' + path.join(
  ISTANBUL_PATH, '/lib/util/file-writer'));

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

var fileWriter = new FileWriter(false);

fileWriter.writeFile = function writeFile(file, callback) {
  if (file.length > 255) {
    var excess = file.length - 255;
    var baseName = path.basename(file, '.html')
    file = file.replace(baseName, baseName.substr(0, (baseName.length - excess) - 1));
  }
  FileWriter.prototype.writeFile.call(fileWriter, file, callback);
};

var reporter = new HtmlReporter({
  verbose: true,
  sourceStore,
  collector,
  writer: fileWriter
});

reporter.writeReport(collector, true);
