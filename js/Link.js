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
	Link.prototype.findNodeById = function(id) {
		if(this.id == id) {
			return this;
		} else
		if(this.id != id) {
			for(var value1 in this.childrenLinks) {
				if(this.childrenLinks[value1].id != id) continue;
				return this.childrenLinks[value1].findNodeById(id);
			}
		} 
		return null;
	}
	var czyIstnieje = function(nodes, child) {
		for(var i = 0; i < nodes.length; i++) {
			if(nodes[i].label.toString() == child.value.toString())
				return i;
		}
		return -1;
	}
}