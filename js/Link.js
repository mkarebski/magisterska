Link = function(id, value, parent, level, children) {
	this.id = id;
	this.value = value;
	this.parent = parent;
	this.level = level;
	this.childrenArray = children;
	this.childrenLinks = {};
	this.form = null;
	this.group="withoutForm";

	Link.prototype.addChild = function(link) {
		this.childrenLinks[link.value] = link;
	}
	Link.prototype.makePaths = function(paths) {
		if(this.childrenArray == null || this.childrenArray.length == 0) {
			var tmpNode = this;
			var tmpPath = [];
			while(tmpNode.parent != null) {
                tmpPath.push(tmpNode);
                tmpNode = tmpNode.parent;
            }
            tmpPath.push(tmpNode);
			paths.push(tmpPath);
		} else {
			for(var value1 in this.childrenLinks) {
				this.childrenLinks[value1].makePaths(paths);
			}
		}
	}
	Link.prototype.findNodeByValue = function(value) {
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
}