    function createChildrenNodes(children) {

        var arrayOfChildren = $.map(children, function(value, index) { return [value]; });
        console.log(children);
        function doneHandler(res, parent) {
                    //console.log(res);
                    //console.log(parent);
                    //console.log("-----------------------------");
                    var htmlObject = parseResult(res);
                    parent.childrenArray = htmlObject.find("a");
                    parent.form = htmlObject.find("form");

//                    console.log(parent.value);
//                    console.log(parent.childrenArray);
                    //console.log("A");
                    //console.log(parent.value);
                    //console.log(parent.form);

                    //if(parent.form.length > 0) {
                    //    $("#forms").html(parent.form);
                    //}

                    if(parent.childrenArray != null && parent.childrenArray.length > 0) {
                        if (parent.level < maxDepthLevel) {
                            for(var i = 0; i < parent.childrenArray.length; i++) {
                                var el = parent.childrenArray[i];
                                var elh = el.href;
                                if(elh.indexOf("mailto:") > -1) continue;
                                elh = convertURL(elh, parent.value);

                                r1 = new Link(idProvider++, elh, parent, parent.level+1, null);
                                parent.addChild(r1);
                                //console.log(r1);
                                var param = getParameter(r1);
                                if(parent.value != r1.value) {
                                    tree.addNode(r1);
                                    tree.addEdge(parent, r1, param);
                                } else {
                                    tree.addEdge(parent, parent, param);
                                }
                            }
                        } else {
                            console.log("wyswietlam sie na koniec");
                        }
                    }
        }

        var requests = [];

        for(var child in children) {
            requests.push($.ajax({
                url: children[child].value,
                type: 'GET',
            }));
        }

        if(requests.length != 0) {
            $("#glassPane").fadeIn("fast");
            $.when.apply($, requests)
            .done(function () {
                if(arguments[1] == "success") { // 1 level
                    doneHandler(arguments[0].results, arrayOfChildren[0]);
                    createChildrenNodes(arrayOfChildren[0].childrenLinks);
                } else { // pozostale levele
                    for(var i = 0; i < arguments.length; i++) {
                        doneHandler(arguments[i][0].results, arrayOfChildren[i]);
                        createChildrenNodes(arrayOfChildren[i].childrenLinks);
                    }
                }
                tree.refresh();
                $("#glassPane").fadeOut("fast");
            })
            .fail(function(xmlhttp, status, error) { 
                alert("wystapil blad! sprawdz konsole");
                console.log(xmlhttp);
                console.log(status);
                console.log(error);
                $("#glassPane").fadeOut("fast");
            });
        }   
    }


jQuery.ajax = (function(_ajax){

    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        //YQL = 'http' + (/^https/.test(protocol)?'s':'') + '://query.yahooapis.com/v1/public/yql?callback=?',
        //YQL = 'https://query.yahooapis.com/v1/public/yql?callback=?',
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
                    url + (o.data ? (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data) : '')
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
