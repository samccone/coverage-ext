chrome.devtools.panels.create("Coverage",
  null,
  "coverage_panel.html",
  function(panel) {
    panel.onShown.addListener(function(panelWindow) {
      panelWindow.document.body.querySelector('#gather').addEventListener(
          'click',
          onGatherClick);

      panelWindow.document.body.querySelector('#copy').addEventListener(
          'click',
          onCopyClick);
    });
  }
);

function onCopyClick() {
  var coveragePromise = new Promise(function(res, rej) {
    chrome.devtools.inspectedWindow.eval('JSON.stringify(__coverage__)', function(v, err) {
      res(v);
    });
  });

  var originalSrcPromise = new Promise(function(res, rej) {
    chrome.devtools.inspectedWindow.eval('JSON.stringify(__originals)', function(v, err) {
      res(v);
    });
  });

  Promise.all([coveragePromise, originalSrcPromise]).then(function(vals) {
    chrome.devtools.inspectedWindow.eval('copy({"coverage": \''+ vals[0] +'\', "originals": \''+ vals[1] +'\'})', function(v, err) {
      if (err) {
        console.log(err);
      }
    });
  });
}

function preprocessor(src, url, fName) {
  function instrumentSrc(src) {
    // Make sure that we store the original src code in a map.
    var prefix = '(window.__originals = window.__originals || {});' +
      'window.__originals["' + url + '"] = "' + btoa(src) + '";';

    return prefix + window.instrument(src, url);
  }

  if (url) {
    return instrumentSrc(src)
  } else {
    return src;
  }
}

var request = new XMLHttpRequest();
request.open('GET', 'instrumenter.js', false);
request.send(null);
var instrumenterSrc = request.responseText

function onGatherClick() {
  chrome.devtools.inspectedWindow.reload({
    preprocessingScript:  instrumenterSrc +
      '(' + preprocessor + ')',
  });
}
