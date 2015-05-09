function Dijkstra (nodes) {
	this.nodes = nodes;
	this.openNodes = [];
	this.visited = [];
	this.path = [];
}

Dijkstra.prototype = {
	constructor: Dijkstra,

	getPath: function (start, end, nodes) {
		start.value = 0;
		openNodes.push(start);
		var current;

		while(openNodes.length > 0) {
			current = getNext(openNodes);
			if(current == end) {
				path.push(current);
				return path;
			}

			expand(current.expand());

			visited.push(current);
			path.push(current);
		}
		return [];
	},

	expand: function (nodes) {
		for (var i = nodes.length - 1; i >= 0; i--) {
			if(visited.indexOf(nodes[i]) > -1) {
				openNodes.push(nodes[i]);
			}
		};
	},

	getNext: function () {
		while(openNodes != []) {
			for (var i = openNodes.length - 1; i >= 0; i--) {
				if(visited.indexOf(openNodes[i]) == -1) {
					return openNodes[i];
				}
				openNodes.pop();
			};
		}
	},

	addToOpen: function (node) {
		for (var i = openNodes.length - 1; i >= 0; i--) {
			if(openNodes[i].value > node.value) {
				openNodes.splice(i, node);
			}
		};
	}
};