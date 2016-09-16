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

function processScripts() {

    function instrumentURL( url ) {

        return new Promise( ( resolve, reject ) => {

            fetch( url, { mode: 'no-cors' } ).then( res => res.text() ).then( src => {

                var saniUrl = (url.replace(/\/|\:|\.|\?/g, '-') + '---' + (Math.random().toFixed(4)));
                var prefix = '(window.__originals = window.__originals || {});' +
                'window.__originals["' + saniUrl + '"] = "' + btoa(unescape(encodeURIComponent(src))) + '";';

                resolve( prefix + window.instrument(src, saniUrl) );

            } ).catch( e => reject( e ) );

        } );

    }

    [].forEach.call( document.querySelectorAll( 'script' ), s => {
        let src = s.getAttribute( 'src' );
        if( src ) {
            instrumentURL( src ).then( res => { eval( window.beautify( res ) ) } ).catch( e => console.log( e, src ) );
        } else {
            eval( window.beautify( window.instrument( s.textContent ) ) );
        }
    } );

}

Promise.all( [
    fetch( chrome.extension.getURL( 'instrumenter.js' ) ).then( res => res.text() ).then( res => instrumenterSrc = res ),
    fetch( chrome.extension.getURL( 'beautify.js' ) ).then( res => res.text() ).then( res => beautifySrc = res )
] ).then( function() {

    //console.log( 'ready' );

} );

var intro = '';//'console.log("here starts the coverage injected script");';

function onGatherClick() {
    chrome.devtools.inspectedWindow.reload({
        injectedScript: intro + instrumenterSrc + beautifySrc +
        processScripts + ';' + 'window.addEventListener("load",processScripts)'
    });
}
