Tree = function(container) {
	this.container = container;
	this.nodes = new vis.DataSet();
	this.edges = new vis.DataSet();
	this.options = {
	    hierarchicalLayout: {
	        layout: "direction",
	    },
	    nodes: {color: "#FFFF5F", shape: "box", fontSize: 10},
	    edges: {style:"arrow"},
	    smoothCurves:false
	}
	this.network = null;
}
Tree.prototype.createNetwork = function() {
	return new vis.Network(document.getElementById(this.container), { nodes: this.nodes, edges: this.edges }, this.options);
}

Tree.prototype.refresh = function() {
	this.network = this.createNetwork();
    this.network.on('select', function(properties) {
        //console.log(properties);
    });
}
Tree.prototype.addNode = function(n) {
	var found = false;
    /*if (nodes._data != undefined && nodes._data != null) 
        for(var i in nodes._data)
            if(nodes._data[i].label == r.value) 
                found = true;*/
    try {
        if(!found) {
            this.nodes.add({
                id: n.id,
                level: n.level,
                label: n.value.toString()
            });
        }
    } catch(err) {
    	console.log(err);
    }
}
Tree.prototype.addEdge = function(n, n1, param) {
    try {
        this.edges.add({
            from: n.id,
            to: n1.id,
            style: "arrow",
            label: param,
            title: n.value+"->"+n1.value,
        });    
    } catch(err) {
        console.log(err);
    }
} 