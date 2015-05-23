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
		/*if(this.value.toString() == value) {
			return this;
		} else
		if(this.value.toString() != value) {
			for(var value1 in this.childrenLinks) {
				if(this.childrenLinks[value1].value != value) continue;
				return this.childrenLinks[value1].findNodeByValue(value);
			}
		} 
		return null;
		*/
		var tmpNode = null;
		if(this.value == value) {
			tmpNode = this;
			return tmpNode;
		} else {
			if(this.childrenArray != null) {
				for(var value1 in this.childrenLinks) {
					tmpNode = this.childrenLinks[value1].findNodeByValue(value);
					if(tmpNode != null) 
						return tmpNode;				
				}
			}
		}
	}
	Link.prototype.findNodeById = function(id) {
		var tmpNode = null;
		if(this.id == id) {
			tmpNode = this;
			return tmpNode;
		} else {
			if(this.childrenArray != null) {
				for(var value1 in this.childrenLinks) {
					tmpNode = this.childrenLinks[value1].findNodeById(id);
					if(tmpNode != null) 
						return tmpNode;				
				}
			}
		}
	}
	var czyIstnieje = function(nodes, child) {
		for(var i = 0; i < nodes.length; i++) {
			if(nodes[i].label.toString() == child.value.toString())
				return i;
		}
		return -1;
	}
}