function BreadthFirstSearch (startNode, endNode) {
	this.startNode = startNode;
	this.endNode = endNode;
	this.openedNodes = [];
	this.nextStep = null;
}

BreadthFirstSearch.prototype = {
	
	constructor: BreadthFirstSearch,

	nextStep: function (node) {
		if(this.nextStep == endNode && node == endNode)
	}	
}