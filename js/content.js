jQuery.ajax = (function(_ajax){

    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        //YQL = 'http' + (/^https/.test(protocol)?'s':'') + '://query.yahooapis.com/v1/public/yql?callback=?',
        YQL = 'https://query.yahooapis.com/v1/public/yql?callback=?',
        query = 'select * from html where url="{URL}" and xpath="\/\/a | \/\/form"';

        function isExternal(url) {
            return !exRegex.test(url) && /:\/\//.test(url);
        }

    return function(o) {

        var url = o.url;

        if ( /get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url) ) {

            // Manipulate options so that JSONP-x request is made to YQL

            o.url = YQL;
            o.dataType = 'jsonp';
            o.async = false;
            o.data = {
                q: query.replace(
                    '{URL}',
                    url + (o.data ?
                        (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data)
                    : '')
                ),
                format: 'xml'
            };

            // Since it's a JSONP request
            // complete === success
            if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
            }

            o.success = (function(_success){
                return function(data) {
                    if (_success) {
                        // Fake XHR callback.
                        _success.call(this, {
                            responseText: data.results
                        }, 'success');
                    }

                };
            })(o.success);

        }
        return _ajax.apply(this, arguments);

    };
})(jQuery.ajax);

$(function() {
  var root = null;
  var idProvider = 1;
  var passageIdProvider = 1;
  var maxDepthLevel = null;
  var spinner = createSpinner();
  var baseUrl = null;
  var tree = null;
  var scenarios = [];

  function createSpinner() {
     var spinnerContainer = $("#depthLevel");
     var spinner =  spinnerContainer.spinner({min: 1}).blur(function () {
            var value1 = spinnerContainer.val();
            if (value1<0 || isNaN(value1)) { spinnerContainer.val(1); }
        });
     spinner.spinner("value", 1);
     return spinner;
  }

  $("#setUrl").click(function() {
    tree = new Tree('treeScenario');

    baseUrl = "http://www.mikolajkarebski.cba.pl";
    root = new Link(0, baseUrl, null, 0, null);
    maxDepthLevel = spinner.spinner("value");

    tree.addNode(root);
    createChildrenNodes(root);
  });

  function repairURL(url, url1) {
    if(url.indexOf("chrome-extension://") > -1) {
        var result = url.match(/^chrome-extension:\/\/([a-zA-Z]*)/);
        var parentDomain = url1.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})?/)[0];
        var subsite = url.replace("chrome-extension://"+result[1], "");
        var url2 = url.replace("chrome-extension://"+result[1], url1);
        if(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})(\/[a-zA-Z0-9]*){2,}?/.test(url2)) {
            return url2;
        } else {
            return parentDomain+subsite;
        }
    }
    return url;
  }

  function getParameter(n1) {
    // TODO: rozdzielenie kilku parametrow zeby byly jeden pod drugim
    return (n1.value.indexOf("?") > 0) ? n1.value.substring(n1.value.indexOf("?")+1) : "";
  }

  function createChildrenNodes(r) {
	var r1 = null;
	$.ajax({
		url: r.value,
        type: 'GET',
        beforeSend: function() {
            $("#glassPane").fadeIn("fast");
        },
	}).done(function(res, textStatus, jqXHR) { 
            var htmlString = "";
            var htmlObject = null;
            for(var i = 0; i < res.results.length; i++) htmlString += res.results[i];
            htmlObject = $("<div />").append(htmlString);

            r.childrenArray = htmlObject.find("a");
            r.form = htmlObject.find("form");
            if(r.childrenArray != null && r.childrenArray.length > 0 && r.level < maxDepthLevel) {
                for(var i = 0; i < r.childrenArray.length; i++) {
                    var el = r.childrenArray[i];
                    var elh = el.href;
                    if(elh.indexOf("mailto:") > -1) continue;
                    elh = repairURL(elh, r.value);
                    if(elh.lastIndexOf("\/") == elh.length - 1) {
                        elh = elh.substring(0, elh.lastIndexOf("/"));
                    }
                    if(elh.indexOf('index.php') > -1)  elh = elh.replace("/index.php", "");
                    if(elh.indexOf('index.html') > -1) elh = elh.replace("/index.html", "");

                    r1 = new Link(idProvider++, elh, r, r.level+1, null);

                    r.addChild(r1);
                    var param = getParameter(r1);
                    if(r.value != r1.value) {
                        //var passage = new Passage(passageIdProvider++, r, r1, param);
                        //passages.push(passage);
                        tree.addNode(r1);
                        tree.addEdge(r, r1, param);
                        createChildrenNodes(r1);
                    } else {
                        tree.addEdge(r, r, param);
                    }
                }
                tree.refresh();
            }
            $("#glassPane").fadeOut("fast");
    }).fail(function(xmlhttp, status, error) { 
            alert("wystapil blad! sprawdz konsole");
            console.log(xmlhttp);
            console.log(status);
            console.log(error);
    }); 
  }
});