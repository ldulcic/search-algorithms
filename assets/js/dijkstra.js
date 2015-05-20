// -------------------------------------------
//                 OBJECTS
// -------------------------------------------
// ---------------- NODE ----------------
function Node(x, y, id) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.cameFrom = null;
    this.links = [];
}

Node.prototype = {

    value: Number.MIN_VALUE,

    constructor: Node,

    addLink: function(link) {
        this.links.push(link);
    },

    removeLink: function(link) {
        var i = this.links.indexOf(link);
        if (i > -1) {
            this.links.splice(i, 1);
        }
    },

    expand: function() {
        var nodes = [];
        var node;
        for (var i = this.links.length - 1; i >= 0; i--) {
            node = this.links[i].node;
            var value = parseInt(this.value) + parseInt(this.links[i].value);
            if (node.value == Number.MIN_VALUE || node.value > value) {
                node.value = value;
                node.cameFrom = this;
            }
            nodes.push(node);
        }
        return nodes;
    }
};

// ---------------- LINK ----------------
function Link(node, value) {
    this.node = node;
    this.value = value;
}

Link.prototype = {
    constructor: Link
};
// ---------------- DIJKSTRA ----------------
function Dijkstra(startNode, endNode) {
    this.startNode = startNode;
    this.startNode.value = 0;
    this.endNode = endNode;
    this.pathDoesntExist = false;
    this.openNodes = [];
    this.visited = [startNode];
	
    var nodes = this.startNode.expand();
    for (var i = nodes.length - 1; i >= 0; i--) {
        nodes[i].cameFrom = this.startNode;
    }
    this.expand(nodes);
    
    if(this.openNodes.length == 0) {
        this.pathDoesntExist = true;
    } else {
        this.nextSteps = this.getNext();
    }
}

Dijkstra.prototype = {
    constructor: Dijkstra,

    inNextSteps: function(node) {
        if (node == endNode && this.nextSteps.indexOf(endNode) != -1) {
            return this.reconstructPath(node);
        }

        var index = this.nextSteps.indexOf(node);
        if (index == -1) {
            return false;
        }

        this.expand(node.expand());

        this.nextSteps.splice(index, 1);
        this.visited.push(node);

        if (this.nextSteps.length == 0) {
            this.nextSteps = this.getNext();
            if(this.nextSteps == null) {
                this.pathDoesntExist = true;
            }
        }
        
        return true;
    },

    expand: function(nodes) {
        for (var i = nodes.length - 1; i >= 0; i--) {
            if (this.visited.indexOf(nodes[i]) == -1) {
                this.addToOpen(nodes[i]);
            }
        }
    },

    getNext: function() {
        while (this.openNodes.length != 0) {
            var possibleNext = [];
            var tmp = this.openNodes.pop();

            if (this.visited.indexOf(tmp) == -1) {
                possibleNext.push(tmp);
                for (var i = this.openNodes.length - 1; i >= 0; i--) {

                    if (this.visited.indexOf(this.openNodes[i]) != -1) {
                        this.openNodes.pop();
                        continue;
                    }

                    if (this.openNodes[i].value == tmp.value) {
                        var node = this.openNodes.pop();
                        if (possibleNext.indexOf(node) == -1) {
                            possibleNext.push(node);
                        }
                    } else {
                        break;
                    }

                }
                return possibleNext;
            }
        }
        return null;
    },

    addToOpen: function(node) {
        if (this.openNodes.length == 0) {
            this.openNodes.push(node);
            return;
        }

        if (node.value > this.openNodes[0].value) {
            this.openNodes.splice(0, 0, node);
            return;
        }

        for (var i = this.openNodes.length - 1; i >= 0; i--) {
            if (this.openNodes[i].value >= node.value) {
                this.openNodes.splice(i + 1, 0, node);
                break;
            }
        }
    },

    findLink: function(aNode) {
        var prevNode;
        var tempnode;
        for (var i = aNode.links.length - 1; i >= 0; i--) {
            tempnode = aNode.links[i].node;
            if (  (this.visited.indexOf(tempnode) != -1) && (tempnode.value + aNode.links[i].value == aNode.value)) {
                prevNode = tempnode;
            }
        }
        for (var i = aNode.links.length - 1; i >= 0; i--) {
            if(aNode.links[i].node === prevNode){
                return aNode.links[i];
            }
        }
    },

    reconstructPath: function (node) {
        var path = [node];
        var tmp;
        while((tmp = node.cameFrom) != null) {
            path.splice(0, 0, tmp);
            node = tmp;
        }

        return path;
    }

};

// -------------------------------------------
//                   MAIN
// -------------------------------------------


// VARIABLES
var startNode = null;
var endNode = null;
var d3startNode = null;
var d3endNode = null;
var nodes = [];
var dijkstra = null;

var docEl = document.documentElement,
    bodyEl = document.getElementsByTagName('body')[0];

var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
    height = window.innerHeight || docEl.clientHeight || bodyEl.clientHeight;

var xLoc = width / 2 - 25,
    yLoc = 100;

// MAIN SVG
var svg = d3.select(settings.appendElSpec).append("svg")
    .attr("width", width)
    .attr("height", height);

var graph = new GraphCreator(svg, [], []);
createGraph({"nodes":[{"id":2,"title":"A","x":161,"y":327},{"id":3,"title":"B","x":462,"y":131},{"id":4,"title":"C","x":470,"y":507},{"id":5,"title":"D","x":759,"y":311}],"edges":[{"source":2,"target":3,"id":"pathId4","weight":Math.floor((Math.random() * 10) + 1)},{"source":2,"target":4,"id":"pathId5","weight":Math.floor((Math.random() * 10) + 1)},{"source":4,"target":5,"id":"pathId6","weight":Math.floor((Math.random() * 10) + 1)},{"source":3,"target":5,"id":"pathId7","weight":Math.floor((Math.random() * 10) + 1)}]},2,5);
	

// LISTENERS
document.getElementById("drawing").addEventListener("click", function(){
	graph.deleteGraph(true);
	graph.setIdCt(2);
	graph.updateGraph();
   	document.getElementById("startgame").style.display = "none";
	document.getElementById("enddrawing").style.display = "inline-block";
	
    GraphCreator.prototype.svgKeyDown = svgKeyD;
    GraphCreator.prototype.svgMouseUp = svgMouseU;
    GraphCreator.prototype.circleMouseDown = circleMouseD;
    GraphCreator.prototype.dragmove = dragmov;
    GraphCreator.prototype.pathMouseDown = pathMouseD;
    GraphCreator.prototype.circleMouseUp = circleMouseU;
});

document.getElementById("selectstart").addEventListener("click", function() {
    GraphCreator.prototype.circleMouseUp = function(d3node, d) {
        startNode = getNode(d.id);
        if (d3startNode != null) {
            d3startNode.select("circle")[0][0].setAttribute("style", "stroke-width:2px");
            d3startNode.select("circle")[0][0].style.fill = "#F6FBFF";
        }
        d3node.select("circle")[0][0].setAttribute("style", "stroke-width:5px");
        d3node.select("circle")[0][0].style.fill = "#9bafd7";
        d3startNode = d3node;
		console.log(d3startNode);
        document.getElementById("selectend").removeAttribute("disabled");
    }

    GraphCreator.prototype.svgKeyDown = function() {

    }
    GraphCreator.prototype.svgMouseUp = function() {

    }
    GraphCreator.prototype.circleMouseDown = function() {

    }
    GraphCreator.prototype.dragmove = function(d) {

    }
    GraphCreator.prototype.pathMouseDown = function() {

    }
});

document.getElementById("selectend").addEventListener("click", function() {
    GraphCreator.prototype.circleMouseUp = function(d3node, d) {
        endNode = getNode(d.id);
        if (d3endNode != null) {
            d3endNode.select("circle")[0][0].setAttribute("style", "stroke-width:2px");
        }
        d3node.select("circle")[0][0].setAttribute("style", "stroke-width:5px");
        d3endNode = d3node;
        document.getElementById("startgame").removeAttribute("disabled");
    }
});

document.getElementById("startgame").addEventListener("click", function() {
    GraphCreator.prototype.circleMouseUp = function(d3node, d) {
        clickedNode = getNode(d.id);
        var edg;
        var l1;
        var l2;
        var e;
        var result = dijkstra.inNextSteps(clickedNode);

        if (result instanceof Array) {
            for(var j = result.length -1; j > 0; j--){
                l1 = result[j];
                document.getElementById("#"+l1.id).getElementsByTagName("circle")[0].style.fill = "#83d675";
                l2 = result[j-1]
                for (var i = graph.edges.length - 1; i >= 0; i--) {
                    e = graph.edges[i];
                    if( (e.source.id == l1.id && e.target.id == l2.id) || (e.target.id == l1.id && e.source.id == l2.id)){
                        edg = graph.edges[i];
                        break;
                    }
                }
                document.getElementById(edg.id).style.stroke = "#83d675";
            }
            document.getElementById("#"+result[0].id).getElementsByTagName("circle")[0].style.fill = "#83d675";
            d3node.select("circle")[0][0].style.fill = "#83d675";
			//pobjeda
			alert("Congratulations!\n\nNow try more advanced graphs, draw your own graphs, or exchange graphs with your friends.");
	
        } else if (result) {
            l = dijkstra.findLink(clickedNode);
            for (var i = graph.edges.length - 1; i >= 0; i--) {
                e = graph.edges[i];
                if( (e.source.id == l.node.id && e.target.id == clickedNode.id) || (e.target.id == l.node.id && e.source.id == clickedNode.id)){
                    edg = graph.edges[i];
                    break;
                }

            }
            document.getElementById(edg.id).style.stroke = "#9bafd7"; 
            d3node.select("circle")[0][0].style.fill = "#9bafd7";
            d3node.on("mouseup",null);
            if(dijkstra.pathDoesntExist){
                window.alert("There is no path between start and end nodes!\n\nTry starter graph if you are confused.");
				createGraph({"nodes":[{"id":2,"title":"A","x":161,"y":327},{"id":3,"title":"B","x":462,"y":131},{"id":4,"title":"C","x":470,"y":507},{"id":5,"title":"D","x":759,"y":311}],"edges":[{"source":2,"target":3,"id":"pathId4","weight":Math.floor((Math.random() * 10) + 1)},{"source":2,"target":4,"id":"pathId5","weight":Math.floor((Math.random() * 10) + 1)},{"source":4,"target":5,"id":"pathId6","weight":Math.floor((Math.random() * 10) + 1)},{"source":3,"target":5,"id":"pathId7","weight":Math.floor((Math.random() * 10) + 1)}]},2,5);
	
                GraphCreator.prototype.circleMouseUp = function() {
                }
            }
        } else {
            wrongAnimation(d3node.select("circle"));

        }
    }

    document.getElementById("selectstart").style.display = "none";
    document.getElementById("selectend").style.display = "none";
    document.getElementById("startgame").style.display = "none";

    dijkstra = new Dijkstra(startNode, endNode);
    if(dijkstra.pathDoesntExist){
        window.alert("There is no path between start and end nodes!\n\nTry starter graph if you are confused.");
		createGraph({"nodes":[{"id":2,"title":"A","x":161,"y":327},{"id":3,"title":"B","x":462,"y":131},{"id":4,"title":"C","x":470,"y":507},{"id":5,"title":"D","x":759,"y":311}],"edges":[{"source":2,"target":3,"id":"pathId4","weight":Math.floor((Math.random() * 10) + 1)},{"source":2,"target":4,"id":"pathId5","weight":Math.floor((Math.random() * 10) + 1)},{"source":4,"target":5,"id":"pathId6","weight":Math.floor((Math.random() * 10) + 1)},{"source":3,"target":5,"id":"pathId7","weight":Math.floor((Math.random() * 10) + 1)}]},2,5);
	
        GraphCreator.prototype.circleMouseUp = function() {}
    }
});

document.getElementById("enddrawing").addEventListener("click", function() {

    var n;
    for (var i = graph.nodes.length - 1; i >= 0; i--) {
        n = graph.nodes[i];
        nodes.push(new Node(n.x, n.y, n.id));
    }

    var source, target, e;
    for (var i = graph.edges.length - 1; i >= 0; i--) {
        e = graph.edges[i];
        source = getNode(e.source.id);
        target = getNode(e.target.id);
        source.addLink(new Link(target, e.weight));
        target.addLink(new Link(source, e.weight));
    }

    document.getElementById("enddrawing").style.display = "none";
    document.getElementById("selectstart").style.display = "inline-block";
    document.getElementById("selectend").style.display = "inline-block";
    document.getElementById("startgame").style.display = "inline-block";
    document.getElementById("startgame").setAttribute("disabled", "");

});

document.getElementById("graph1").addEventListener("click",
    function() {
        createGraph({"nodes":[{"id":2,"title":"A","x":161,"y":327},{"id":3,"title":"B","x":462,"y":131},{"id":4,"title":"C","x":470,"y":507},{"id":5,"title":"D","x":759,"y":311}],"edges":[{"source":2,"target":3,"id":"pathId4","weight":Math.floor((Math.random() * 10) + 1)},{"source":2,"target":4,"id":"pathId5","weight":Math.floor((Math.random() * 10) + 1)},{"source":4,"target":5,"id":"pathId6","weight":Math.floor((Math.random() * 10) + 1)},{"source":3,"target":5,"id":"pathId7","weight":Math.floor((Math.random() * 10) + 1)}]},2,5);
	});
	
document.getElementById("graph2").addEventListener("click",
	function() {
		createGraph({"nodes":[{"id":2,"title":"A","x":69,"y":358},{"id":3,"title":"B","x":342,"y":141},{"id":4,"title":"C","x":305,"y":527},{"id":5,"title":"D","x":661,"y":151},{"id":6,"title":"E","x":652,"y":533},{"id":7,"title":"F","x":887,"y":355}],"edges":[{"source":6,"target":7,"id":"pathId5","weight":Math.floor((Math.random() * 20) + 1)},{"source":5,"target":7,"id":"pathId6","weight":Math.floor((Math.random() * 20) + 1)},{"source":2,"target":3,"id":"pathId7","weight":Math.floor((Math.random() * 20) + 1)},{"source":2,"target":4,"id":"pathId8","weight":Math.floor((Math.random() * 20) + 1)},{"source":4,"target":5,"id":"pathId9","weight":Math.floor((Math.random() * 20) + 1)},{"source":3,"target":6,"id":"pathId10","weight":Math.floor((Math.random() * 20) + 1)}]},2,7);
	});	
	
document.getElementById("graph3").addEventListener("click",
	function(){
		createGraph({"nodes":[{"id":2,"title":"A","x":75,"y":322},{"id":3,"title":"B","x":341,"y":82},{"id":4,"title":"C","x":341,"y":546},{"id":5,"title":"D","x":583,"y":312},{"id":6,"title":"E","x":820,"y":96},{"id":7,"title":"F","x":818,"y":534},{"id":8,"title":"G","x":578,"y":745},{"id":9,"title":"H","x":592,"y":-124},{"id":10,"title":"I","x":1048,"y":329}],"edges":[{"source":6,"target":10,"id":"pathId11","weight":Math.floor((Math.random() * 30) + 1)},{"source":2,"target":3,"id":"pathId12","weight":Math.floor((Math.random() * 30) + 1)},{"source":2,"target":4,"id":"pathId13","weight":Math.floor((Math.random() * 30) + 1)},{"source":3,"target":5,"id":"pathId14","weight":Math.floor((Math.random() * 30) + 1)},{"source":3,"target":9,"id":"pathId15","weight":Math.floor((Math.random() * 30) + 1)},{"source":4,"target":5,"id":"pathId16","weight":Math.floor((Math.random() * 30) + 1)},{"source":4,"target":8,"id":"pathId17","weight":Math.floor((Math.random() * 30) + 1)},{"source":8,"target":7,"id":"pathId18","weight":Math.floor((Math.random() * 30) + 1)},{"source":5,"target":7,"id":"pathId19","weight":Math.floor((Math.random() * 30) + 1)},{"source":7,"target":10,"id":"pathId20","weight":Math.floor((Math.random() * 30) + 1)},{"source":5,"target":6,"id":"pathId21","weight":Math.floor((Math.random() * 30) + 1)},{"source":9,"target":6,"id":"pathId22","weight":Math.floor((Math.random() * 30) + 1)}]},2,10);
	});		

// FUNCTIONS
function createGraph(json,start,end){
    GraphCreator.prototype.svgKeyDown = function() {}
    GraphCreator.prototype.svgMouseUp = function() {}
    GraphCreator.prototype.circleMouseDown = function() {}
    GraphCreator.prototype.dragmove = function(d) {}
    GraphCreator.prototype.pathMouseDown = function() {}
	if(!this.graph.nodes === []){
		return;
	}
    graph.deleteGraph(true);
		var jsonObj = json;
        graph.nodes = jsonObj.nodes;
        graph.setIdCt(jsonObj.nodes.length + 1);
        var newEdges = jsonObj.edges;
        newEdges.forEach(function(e, i) {
        newEdges[i] = {
            source: graph.nodes.filter(function(n) {
                return n.id == e.source;
                })[0],
                target: graph.nodes.filter(function(n) {
                return n.id == e.target;
                })[0],
                id: e.id,
                weight: e.weight
                };
         });
         graph.edges = newEdges;
		 graph.updateGraph();
		 this.nodes = [];
		 
		var n;
		for (var i = graph.nodes.length - 1; i >= 0; i--) {
			n = graph.nodes[i];
			nodes.push(new Node(n.x, n.y, n.id));
		}

		var source, target, e;
		for (var i = graph.edges.length - 1; i >= 0; i--) {
			e = graph.edges[i];
			source = getNode(e.source.id);
			target = getNode(e.target.id);
			source.addLink(new Link(target, e.weight));
			target.addLink(new Link(source, e.weight));
		}
        
		this.startNode = getNode(start);
		this.endNode = getNode(end);
        document.getElementById("#"+start).getElementsByTagName("circle")[0].setAttribute("style", "stroke-width:5px");
		document.getElementById("#"+start).getElementsByTagName("circle")[0].style.fill = "#9bafd7";
		document.getElementById("#"+end).getElementsByTagName("circle")[0].setAttribute("style", "stroke-width:5px");
		document.getElementById("enddrawing").style.display = "none";
		document.getElementById("startgame").style.display = "inline-block";
		document.getElementById("startgame").removeAttribute("disabled");
		document.getElementById("selectend").style.display = "none";
		document.getElementById("selectstart").style.display = "none";
}

function getNode(id) {
	console.log(nodes);
    for (var i = nodes.length - 1; i >= 0; i--) {
		if (nodes[i].id == id) {
            return nodes[i];
        }
    }
    return null;
}

function wrongAnimation(node){
    node
    .transition()
    .style("fill","red")
    .duration(125)
    .transition()
    .style("fill","#F6FBFF")
    .duration(125)
    .transition()
    .style("fill","red")
    .duration(125)
    .transition()
    .style("fill","#F6FBFF")
    .duration(125);
}