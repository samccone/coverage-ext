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

function preprocessor(src, url, fName)
{
  console.log(url);
  return src;
}

function onGatherClick() {
  chrome.devtools.inspectedWindow.reload({
    preprocessingScript:  "(" + preprocessor + ")",
  });
}
