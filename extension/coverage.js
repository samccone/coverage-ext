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


/*
    If specified, this script evaluates into a function
    that accepts three string arguments: the source to
    preprocess, the URL of the source, and a function
    name if the source is an DOM event handler. The
    preprocessorerScript function should return a string
    to be compiled by Chrome in place of the input source.
    In the case that the source is a DOM event handler,
    the returned source must compile to a single JS function.
*/

function processScripts() {

    var oldEval = window.eval;
    window.eval = function() {
//        console.log( 'eval', arguments );
        console.log( 'INS EVAL' );
        eval( window.beautify( window.instrument( arguments[ 0 ] ) ) );
        return oldEval.apply( window, arguments );
    }

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
            console.log( 'INS URL', src );
            instrumentURL( src ).then( res => { oldEval( res ) ) } ).catch( e => console.log( e, src ) );
        } else {
           console.log( 'INS SCRIPT' );
           oldEval( window.beautify( window.instrument( s.textContent ) ) );
        }
    } );

    [].forEach.call( document.querySelectorAll('*'), e => {
        [].forEach.call( e.attributes, a => {
            if( a.nodeName.match( /^on/gmi ) ){
                console.log( 'INS INLINE' );
                oldEval( window.beautify( window.instrument( a.nodeValue ) ) );
            }
        } )
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
