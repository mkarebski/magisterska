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
	var nodesWithForms = {};
    var paths = {};

	$("#setUrl").click(function() {
		idProvider = 1;
        paths = {};

        $("#forms").empty();
        $("#scenarios").empty();
		tree = new Tree('treeScenario');

        // TODO BLEDY O NIEPOPRAWNOSCI DOKUMENTU XML
        //baseUrl = "localhost/www/aplikacja3";
        // baseUrl = "localhost/www/aplikacja2";
		//baseUrl = "localhost/www/wordpress";
        baseUrl = "localhost/www/portfolio";
		//baseUrl = $("input[name=url]").val();
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
                
				activeAjaxs -= 1;
                if(result.status.http_code == 200) { //bylo != 404
                    var htmlObject = null;
                    htmlObject = $("<span></span>").append(result.contents);
                    htmlObject.find("link").remove();

                    if(r.level != maxDepthLevel)
                        r.childrenArray = htmlObject.find("a");

                    r.form = htmlObject.find("form");

                    if(r.childrenArray != null && r.childrenArray.length > 0 && r.level < maxDepthLevel) {
                        for(var i = 0; i < r.childrenArray.length; i++) {
                            var el = r.childrenArray[i];
                            var elh = el.href;

                            if(/mailto:/.test(elh)) continue;
                            if(/.(zip|exe|pdf)$/.test(elh)) continue;
                            if(/#$/.test(elh)) continue;
                            elh = convertURL(elh, r.value);
                            
                            r1 = new Link(idProvider++, elh, r, r.level+1, null);
                            r.addChild(r1);

                            var param = getParameter(r1);

                            var tmpNode = r1;
                            while(tmpNode.parent != null) {
                                tmpNode = tmpNode.parent;
                                if (tmpNode.value == elh) 
                                    r1.loop = tmpNode;
                            }

                            if(r1.loop != null) {
                                tree.addEdge(r1.parent, r1.loop, param);
                                continue;
                            }

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
                } else {
                    for(var node1 in tree.nodes._data) {
                        var n = tree.nodes._data[node1];
                        if(r.id == n.id) {
                            n.group = 'invalid';
                            r.group = 'invalid';
                        }
                    }
                }
		}).fail(function(xmlhttp, status, error) { 
                activeAjaxs -= 1;
				alert("wystapil blad serwera proxy! sprawdz konsole");
				console.log(xmlhttp);
				console.log(status);
				console.log(error);
				$("#glassPane").fadeOut("fast");
		}).always(function(xmlhttp, status, error) { 
			if(activeAjaxs == 0) {
				for(var node1 in tree.nodes._data) {
					var n = tree.nodes._data[node1];
					var node = root.findNodeById(n.id);
					if(node != undefined && node != null && node.form!= null && node.form.length > 0) {
						n.group = 'withForm';
						node.group = 'withForm';
                        nodesWithForms[n.id] = node;
					}
				}
				tree.refresh();

                root.makePaths(paths);

                for (var i in paths) {
                    var reversedPathLabel = returnPath(paths[i]);
                    var ul = $("#scenarios").append("<li>"+reversedPathLabel+"</li>");
                    var li = $("li:contains('"+reversedPathLabel+"')");
                    if(isIncorrect(paths[i])) {
                        li.addClass("error");
                    } else {
                        li.addClass("noerror");
                    }
                }

				tree.network.on('select', function(properties) {
					$("#forms").empty();
                    for(var node in nodesWithForms)
						if (nodesWithForms[node].id == properties.nodes[0]) 
							$("#forms").html(nodesWithForms[node].form);
                        
				});
				$("#glassPane").fadeOut("fast");
			}
		});
    }   

    function isIncorrect(path) {
        for(var i = 0; i < path.length; i++) 
            if(path[i].group == 'invalid') 
               return true;
        return false;
    }

    function testScenario(nodes) {
        var invalid = false;
        var invalidNodes = {};
        var activeAjaxs = 0;
        var requests = [];
        var node = null;
        for(var i = 0; i < nodes.length; i++) {
            //wordpress app Uncaught TypeError: Cannot read property 'value' of undefined line 152
            node = nodes[i];
            $.ajax({
                url: "http://localhost/www/ba-simple-proxy.php?url="+nodes[i].value,
                type: 'GET',
                dataType: "text",
                beforeSend: function() {
                    $("#glassPane").fadeIn("fast");
                    activeAjaxs += 1;
                },
            }).done(function(res, textStatus, jqXHR) { 
                res = res.replace(res.substring(0, res.indexOf("{")),"");
                result = JSON.parse(res);
                
                activeAjaxs -= 1;
                if(result.status.http_code == 404) {
                    invalid = true;
                    invalidNodes[node.id] = node;
                }
            }).fail(function(xmlhttp, status, error) { 
                    activeAjaxs -= 1;
                    alert("wystapil blad serwera proxy! sprawdz konsole");
                    console.log(xmlhttp);
                    console.log(status);
                    console.log(error);
                    $("#glassPane").fadeOut("fast");
            }).always(function(xmlhttp, status, error) { 
                if(activeAjaxs == 0) {
                    if(invalid) {
                        $("li:contains('"+returnPath(nodes)+"')").addClass("error").removeClass("noerror");

                        for (var node in invalidNodes) {
                            for(var node1 in tree.nodes._data) {
                                var n = tree.nodes._data[node1];
                                if(node == n.id) {
                                    n.group = 'invalid';
                                }
                            }
                        }
                        tree.refresh();
                    } else {
                        $("li:contains('"+returnPath(nodes)+"')").addClass("noerror").removeClass("error");

                        for (var i = 0; i < nodes.length; i++) {
                            for(var node1 in tree.nodes._data) {
                                var n = tree.nodes._data[node1];
                                if(nodes[i].id == n.id) {
                                    n.group = 'withoutForm';
                                }
                            }
                        }
                        tree.refresh();
                    }
                }
            });
        }
    }

    $(document).on('click', 'li', function() { 
        $("#glassPane").fadeIn("fast");
        var labelValue = $('<div />').html(this.innerHTML).text();
        testScenario(paths[labelValue]);
        $("#glassPane").fadeOut("fast");
    });

    var oldStyles = {};
    $(document).on('mouseover', 'li', function() { 
        var labelValue = $('<div />').html(this.innerHTML).text();
        var scenario = paths[labelValue];

        for (var i = 0; i < scenario.length; i++) {
            for(var node1 in tree.nodes._data) {
                var n = tree.nodes._data[node1];
                if(scenario[i].id == n.id) {
                    oldStyles[n.id] = n.group;
                    n.group = 'hover';
                }
            }
        }
        tree.refresh();
    });

    $(document).on('mouseout', 'li', function() { 
        var labelValue = $('<div />').html(this.innerHTML).text();
        var scenario = paths[labelValue];
        
        for(var node1 in tree.nodes._data) {
            for(var style in oldStyles) {
                var n = tree.nodes._data[node1];
                if(n.id == style) {
                    n.group = oldStyles[style];
                }
            }
        }
        tree.refresh();
        oldStyles = {};
    });

    function createSpinner() {
         var spinnerContainer = $("#depthLevel");
         var spinner =  spinnerContainer.spinner({min: 1}).blur(function () {
                var value1 = spinnerContainer.val();
                if (value1<0 || isNaN(value1)) { spinnerContainer.val(1); }
            });
         spinner.spinner("value", 1);
         return spinner;
    }

    function returnPath(s) {
        var str = "";
        for(var i = 0; i < s.length-1; i++) {
            str += s[i].id + " > ";
        }
        str += s[s.length-1].id;
        return str;
    }

    function getParameter(n1) {
        // TODO: rozdzielenie kilku parametrow zeby byly jeden pod drugim
        return (n1.value.indexOf("?") > 0) ? n1.value.substring(n1.value.indexOf("?")+1) : "";
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
            var parentDomain = null;
            if(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})?/.test(url1)) { //regular url like 'www.mikolajkarebski.cba.pl'
                parentDomain = url1.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})?/)[0];
            } else {    // domain = localhost
                var regex1 = /\/[a-zA-Z]*\.[a-zA-Z]*/;
                if(regex1.test(url1)) {
                    parentDomain = url1.replace(url1.match(regex1)[0],"");  
                } else {
                    parentDomain = url1;
                }
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
