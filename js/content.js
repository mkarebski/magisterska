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
    var lastLevelChildren = [];

	$("#setUrl").click(function() {
		idProvider = 1;
        lastLevelChildren = [];

        $("#scenarios").empty();
		tree = new Tree('treeScenario');
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
				//console.log(activeAjaxs);
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
						elh = convertURL(elh, r.value);
						if(r.findNodeByValue(elh) != null/* && r.value != elh*/) continue; // TUTAJ COS TRZEBA WYMYSLIC!!!!!!!!!!!!!!

						r1 = new Link(idProvider++, elh, r, r.level+1, null);
						r.addChild(r1);

                        if(r1.level == maxDepthLevel)
                            lastLevelChildren.push(r1);

						var param = getParameter(r1);
						if(r.value != r1.value) {
							tree.addNode(r1);
							//if(r.parent != null && r.parent.value == r1.value) 
								//tree.addEdge(r, r.parent, param);
							//else 
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
					if(node != undefined && node != null && node.form!= null && node.form.length > 0) {
						n.group = 'withForm';
						nodesWithForms.push(node);
					}
				}
				tree.refresh();

                for(var i = 0; i < lastLevelChildren.length; i++) {
                    var tmpNode = lastLevelChildren[i];
                    var scenario = tmpNode.id ;
                    while(tmpNode.parent != null) {
                        scenario = scenario + " > " + tmpNode.parent.id;
                        tmpNode = tmpNode.parent;
                    }
                    scenarios.push(swap(scenario));
                    var li = $("#scenarios").append("<li>"+swap(scenario)+"</li>");
                    testScenario(swap(scenario));
                }

				tree.network.on('select', function(properties) {
					$("#forms").empty();
					for(var i = 0; i < nodesWithForms.length; i++) 
						if (nodesWithForms[i].id == properties.nodes[0]) 
							$("#forms").html(nodesWithForms[i].form);
				});
				$("#glassPane").fadeOut("fast");
			}
		});
    }   

    function testScenario(scenario) {
        var nodes = scenario.split(" > ");
        var requests = [];
        for(var i = 0; i < nodes.length; i++) {
            var node = root.findNodeById(nodes[i]);
            requests.push($.ajax({
                url: "http://localhost/www/ba-simple-proxy.php?url="+node.value,
                type: 'GET',
                dataType: "text",
            }));
        }

        $.when(requests)
        .done(function() {
            $("li:contains('"+scenario.toString()+"')").addClass("noerror");
        })
        .fail(function() {
            $("li:contains('"+scenario.toString()+"')").addClass("error");  
        });
    }

    $(document).on('click', 'li', function() { 
        $("#glassPane").fadeIn("fast");
        var decodedValue = $('<div />').html(this.innerHTML).text()
        testScenario(decodedValue);
        $("#glassPane").fadeOut("fast");
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

    function swap(s) {return s.split(" > ").reverse().join(" > ");}

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