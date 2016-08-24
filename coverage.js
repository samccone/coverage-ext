chrome.devtools.panels.create("Coverage",
  null,
  "coverage_panel.html",
  function(panel) {
    panel.onShown.addListener(function(panelWindow) {
      panelWindow.document.body.querySelector('#gather').addEventListener('click',
          onGatherClick);
    });
  }
);

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
