function BreadthFirstSearch (startNode, endNode) {
	this.startNode = startNode;
	this.endNode = endNode;
	this.openedNodes = [];
	this.expand(startNode.expand());
	if(openedNodes.length == 0) return null;
	this.nextStep = openedNodes.pop();
}

BreadthFirstSearch.prototype = {
	
	constructor: BreadthFirstSearch,

	nextStep: function (node) {
		if(this.nextStep == endNode && node == endNode) {
			//kraj
		}

		if(nextStep != node) {
			return false;
		}

		this.expand(node.expand());
		this.nextStep = openedNodes.pop();
	},

	expand: function (nodes) {
		for (var i = nodes.length - 1; i >= 0; i--) {
			openedNodes.splice(0, 0, nodes[i]);
		};
	}	
}