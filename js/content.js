

$(function() {
    var root = null;
    var idProvider = 1;
    var passageIdProvider = 1;
    var maxDepthLevel = null;
    var spinner = createSpinner();
    var baseUrl = null;
    var tree = null;
    var scenarios = [];
    var activeAjaxs = 0;
    var nodesWithForms = [];

    $("#setUrl").click(function() {
        tree = new Tree('treeScenario');

        //baseUrl = "http://www.mikolajkarebski.cba.pl";
        baseUrl = "http://localhost/www/wordpress";
        root = new Link(0, baseUrl, null, 0, null);
        maxDepthLevel = spinner.spinner("value");

        tree.addNode(root);
        createChildrenNodes(root);
    });

  function createChildrenNodes(r) {
    var r1 = null;
    $.ajax({
        url: "http://localhost/www/ba-simple-proxy.php?url="+r.value,
        type: 'GET',
        dataType: "text",
        beforeSend: function() {
            $("#glassPane").fadeIn("fast");
            activeAjaxs += 1;
        },
    }).done(function(res, textStatus, jqXHR) { 
            res = res.replace(res.substring(0, res.indexOf("{")),"");
            result = JSON.parse(res);
            //console.log(result.contents);
            activeAjaxs -= 1;
            //var htmlString = "";
            var htmlObject = null;
            //for(var i = 0; i < res.results.length; i++) htmlString += res.results[i];
            //htmlObject = $("<div />").append(htmlString);
            htmlObject = $("<div />").append(result.contents);

            r.childrenArray = htmlObject.find("a");
            //console.log(r.childrenArray);
            r.form = htmlObject.find("form");

            if(r.childrenArray != null && r.childrenArray.length > 0 && r.level < maxDepthLevel) {
                for(var i = 0; i < r.childrenArray.length; i++) {
                    var el = r.childrenArray[i];
                    var elh = el.href;
                    if(elh.indexOf("mailto:") > -1) continue;
                    elh = convertURL(elh, r.value);

                    r1 = new Link(idProvider++, elh, r, r.level+1, null);

                    r.addChild(r1);
                    var param = getParameter(r1);
                    if(r.value != r1.value) {
                        tree.addNode(r1);
                        tree.addEdge(r, r1, param);
                        createChildrenNodes(r1);
                    } else {
                        tree.addEdge(r, r, param);
                    }
                }
                tree.refresh();
            }
    }).fail(function(xmlhttp, status, error) { 
            alert("wystapil blad! sprawdz konsole");
            console.log(xmlhttp);
            console.log(status);
            console.log(error);
            $("#glassPane").fadeOut("fast");
    }).always(function(xmlhttp, status, error) { 
        if(activeAjaxs == 0) {
            for(var node in tree.nodes._data) {
                var n = tree.nodes._data[node];
                var node = root.findNodeById(n.id);
                if(node != undefined && node != null && node.form.length > 0) {
                    n.group = 'withForm';
                    nodesWithForms.push(node);
                }
            }
            tree.refresh();
            tree.network.on('select', function(properties) {
                console.log(properties.nodes[0]);
                console.log(nodesWithForms);
                $("#forms").empty();
                for(var i = 0; i < nodesWithForms.length; i++) 
                    if (nodesWithForms[i].id == properties.nodes[0]) 
                        $("#forms").html(nodesWithForms[i].form);
            });
            console.log(root);
            $("#glassPane").fadeOut("fast");
        }
    });
}

    function createSpinner() {
         var spinnerContainer = $("#depthLevel");
         var spinner =  spinnerContainer.spinner({min: 1}).blur(function () {
                var value1 = spinnerContainer.val();
                if (value1<0 || isNaN(value1)) { spinnerContainer.val(1); }
            });
         spinner.spinner("value", 1);
         return spinner;
    }

    function getParameter(n1) {
        // TODO: rozdzielenie kilku parametrow zeby byly jeden pod drugim
        return (n1.value.indexOf("?") > 0) ? n1.value.substring(n1.value.indexOf("?")+1) : "";
    }

    function parseResult(res) {
            var htmlString = "";
            for(var i = 0; i < res.length; i++) htmlString += res[i];
            return $("<div />").append(htmlString);
    }

    function convertURL(elh, parentValue) {
        elh = repairURL(elh, parentValue);
        if(elh.lastIndexOf("\/") == elh.length - 1) {
            elh = elh.substring(0, elh.lastIndexOf("/"));
        }
        if(elh.indexOf('index.php') > -1)  elh = elh.replace("/index.php", "");
        if(elh.indexOf('index.html') > -1) elh = elh.replace("/index.html", "");
        return elh;
    }

    function repairURL(url, url1) {
        if(url.indexOf("chrome-extension://") > -1) {
            var result = url.match(/^chrome-extension:\/\/([a-zA-Z]*)/);
            console.log(url1);
            var parentDomain = null;
            if(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})?/.test(url1)) { //regular url like 'www.mikolajkarebski.cba.pl'
                parentDomain = url1.match()[0];
            } else {    // domain = localhost
                parentDomain = url1;
            } 
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

});