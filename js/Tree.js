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
	    smoothCurves:false,
        groups: {
          withoutForm: {
            shape: 'box',
            color: {
              border: 'black',
              background: '#FFFF5F',
            }
          },
          withForm: {
            shape: 'box',
            color: {
              border: 'black',
              background: '#C9FFC7',
            }
          }
        }
	}
	this.network = null;
}
Tree.prototype.createNetwork = function() {
	return new vis.Network(document.getElementById(this.container), { nodes: this.nodes, edges: this.edges }, this.options);
}

Tree.prototype.refresh = function() {
	this.network = this.createNetwork();
}
Tree.prototype.addNode = function(n) {
    //console.log(n);
    //console.log(n.form);
	var found = false;
    /* 
    if (this.nodes._data != undefined && this.nodes._data != null) 
        for(var i in this.nodes._data)
            if(this.nodes._data[i].label == n.value) 
                found = true;
    */
    try {
        if(!found) {
            var group1 = (n.form != null) ? 'withForm' : 'withoutForm';
            this.nodes.add({
                id: n.id,
                level: n.level,
                label: n.value.toString(),
                group: group1
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