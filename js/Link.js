Link = function(id, value, parent, level, children) {
	this.id = id;
	this.value = value;
	this.parent = parent;
	this.level = level;
	this.childrenArray = children;
	this.childrenLinks = {};
	this.form = null;
	
	Link.prototype.addChild = function(link) {
		this.childrenLinks[link.value] = link;
	}
	Link.prototype.parseToNetwork = function(nodes, edges) {
		if (this.parent == null) 
			nodes.push({id: this.id, level: this.level, label: this.value.toString()});
		
		var children = this.childrenLinks;
		for(var href in children) {
			
			var child = children[href];
			if(this.value.toString() != child.value.toString()) {
				var childId = null;
				var tmpIndex = czyIstnieje(nodes,child);
				if(tmpIndex == -1) {
					nodes.push({id: child.id, level: child.level, label: child.value.toString()});
					childId = child.id;
				}else 
					childId = nodes[tmpIndex].id;
					
				edges.push({from: this.id, to: childId, style:"arrow"});
				child.parseToNetwork(nodes, edges);
			} else 
				edges.push({from: this.id, to: this.id, style:"arrow"});
			
		}
	
		return {nodes: nodes, edges: edges};
	}

	Link.prototype.findNodeByValue = function(value) {
		if(this.value.toString() == value) {
			return this;
		} else
		if(this.value.toString() != value) {
			for(var value1 in this.childrenLinks) {
				if(this.childrenLinks[value1].value != value) continue;
				return this.childrenLinks[value1].findNodeByValue(value);
			}
		} 
		return null;
	}

	Link.prototype.completeNodes = function(graph) {
			var exists = false;
			for(var value in graph.nodes)
				if(graph.nodes[value].label == this.value)
					exists = true;

			if(!exists)
				graph.addNode(this.id, {label : this.value, render : renderFunc});

			for(var value1 in this.childrenLinks) {
				this.childrenLinks[value1].completeNodes(graph);
			}
  	}
  	Link.prototype.completeEdges = function(graph) {
  		for(var value1 in this.childrenLinks) {
			graph.addEdge(this.id, this.childrenLinks[value1].id, {directed : true});
			if (this.value == this.childrenLinks[value1].value) 
  				graph.addEdge(this.childrenLinks[value1].id, this.id, {directed : true});
		}

  	}
	var czyIstnieje = function(nodes, child) {
		for(var i = 0; i < nodes.length; i++) {
			if(nodes[i].label.toString() == child.value.toString())
				return i;
		}
		return -1;
	}
	var renderFunc = function(r, n) {			
			var w = $("#textWidth").text(n.label).width();
			var h = $("#textWidth").text(n.label).height();

            /* the Raphael set is obligatory, containing all you want to display */
            var set = r.set().push(
                /* custom objects go here */
                //r.rect(n.point[0]-30, n.point[1]-13, 62, 66).attr({"fill": "ffffcf", "stroke-width": 1, r : "9px"})).push(
                r.rect(n.point[0], n.point[1], w, h).attr({"fill": "ffffcf", "stroke-width": 1, r : "9px"})).push(
                r.text(n.point[0] + (w/2), n.point[1] + (h/2), n.label).attr({"font-size":"14px"}));
            /* custom tooltip attached to the set */
            //set./*tooltip = Raphael.el.tooltip;*/items.forEach(function(el) {el.tooltip(r.set().push(r.rect(0, 0, 30, 30).attr({"fill": "#fec", "stroke-width": 1, r : "9px"})))});
//            set.tooltip(r.set().push(r.rect(0, 0, 30, 30).attr({"fill": "#fec", "stroke-width": 1, r : "9px"})).hide());
            return set;
    };
}