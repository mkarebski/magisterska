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
          },
          invalid: {
            shape: 'box',
            color: {
              border: 'black',
              background: '#FF0000',
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
Tree.prototype.addNode = function(n, group) {
    var tmpGroup = group;
    if(tmpGroup == undefined) tmpGroup = 'withoutForm';
    try {
        this.nodes.add({
            id: n.id,
            level: n.level,
            label: '('+n.id+') '+n.value.toString(),
            group: tmpGroup
        });
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