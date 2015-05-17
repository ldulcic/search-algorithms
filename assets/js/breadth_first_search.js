function BreadthFirstSearch (startNode, endNode) {
	this.startNode = startNode;
	this.endNode = endNode;
	this.openedNodes = [];
	this.visited = [startNode];
	this.pathDoesntExist = false;
	
    var nodes = this.startNode.expand();
    for (var i = nodes.length - 1; i >= 0; i--) {
        nodes[i].cameFrom = this.startNode;
    }
    this.expand(nodes);

	if(this.openedNodes.length == 0) {
		this.pathDoesntExist = true;
	} else {
		this.nextStep = this.openedNodes.pop();
	}
}

BreadthFirstSearch.prototype = {
	
	constructor: BreadthFirstSearch,

	isNextStep: function (node) {
		if(this.nextStep == endNode && node == endNode) {
			return this.reconstructPath(node);
		}

		if(this.nextStep != node) {
			return false;
		}

		this.visited.push(node);

        var nodes = node.expand();
        for (var i = nodes.length - 1; i >= 0; i--) {
            if(nodes[i].cameFrom == null && this.visited.indexOf(nodes[i]) == -1) {
                nodes[i].cameFrom = node;
            }
        }
		this.expand(nodes);
		
        if(this.openedNodes.length == 0) {
			this.pathDoesntExist = true;
		} else {
			this.nextStep = this.getNext();
			if(this.nextStep == null) return null;
		}

		return true;
	},

	expand: function (nodes) {
		nodes.sort(function (a, b) {
			if(a.id < b.id) {
				return 1;
			} else if(a.id > b.id) {
				return -1;
			} else {
				return 0;
			}
		});

		for (var i = nodes.length - 1; i >= 0; i--) {
			if(this.visited.indexOf(nodes[i]) == -1) {
				this.openedNodes.splice(0, 0, nodes[i]);
			}
		}
	},

	getNext: function () {
		var node;
		while(this.openedNodes.length > 0) {
			node = this.openedNodes.pop();
			if(this.visited.indexOf(node) == -1) {
				return node;
			}
		}
		return null;
	},

    findLink: function(aNode) {
        var prevNode;
        var tempnode;
        for (var i = aNode.links.length - 1; i >= 0; i--) {
            tempnode = aNode.links[i].node;
            if (  (this.visited.indexOf(tempnode) != -1) && ( tempnode == aNode.cameFrom)) {
                prevNode = aNode.links[i];
                break;
            }
        }
        return prevNode;
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
}

// -------------------------------------------
//                   MAIN
// -------------------------------------------


// VARIABLES
var startNode = null;
var endNode = null;
var d3startNode = null;
var d3endNode = null;
var nodes = [];
var search = null;

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
graph.setIdCt(2);
graph.updateGraph();

// LISTENERS
document.getElementById("selectstart").addEventListener("click", function() {
    GraphCreator.prototype.circleMouseUp = function(d3node, d) {
        startNode = getNode(d.id);
        if (d3startNode != null) {
            d3startNode.select("circle")[0][0].style.fill = "#F6FBFF";
        }
        d3node.select("circle")[0][0].style.fill = "#9bafd7";
        d3startNode = d3node;
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
        var result = search.isNextStep(clickedNode);

        if (result instanceof Array) {
            console.log("uso u kraj");
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
            window.alert("dobro je, ne pritsci vise nista!");
            console.log(result);
        } else if (result) {
            var l = search.findLink(clickedNode);
            for (var i = graph.edges.length - 1; i >= 0; i--) {
                e = graph.edges[i];
                if( (e.source.id == l.node.id && e.target.id == clickedNode.id) || (e.target.id == l.node.id && e.source.id == clickedNode.id)){
                    edg = graph.edges[i];
                    break;
                }

            }
            document.getElementById(edg.id).style.stroke = "#9bafd7"; 
            d3node.select("circle")[0][0].style.fill = "##9bafd7";
            d3node.on("mouseup",null);
        } else {
            wrongAnimation(d3node.select("circle"));
            
        }

    }

    document.getElementById("selectstart").style.display = "none";
    document.getElementById("selectend").style.display = "none";

    search = new BreadthFirstSearch(startNode, endNode);
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

});

document.getElementById("graph1").addEventListener("click",
    function() {
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
        graph.deleteGraph();
        graph.updateGraph();
        graph.nodes.push({
            "title": "a",
            "x": "200",
            "y": "300",
            "id": 1
        });
        graph.nodes.push({
            "title": "b",
            "x": "800",
            "y": "300",
            "id": 2
        });
        graph.nodes.push({
            "title": "c",
            "x": "500",
            "y": "100",
            "id": 3
        });
        graph.nodes.push({
            "title": "d",
            "x": "500",
            "y": "500",
            "id": 4
        });
        graph.updateGraph();
        graph.edges.push({
            "source": graph.nodes[0],
            "target": graph.nodes[2]
        });
        graph.edges.push({
            "source": graph.nodes[0],
            "target": graph.nodes[3]
        });
        graph.edges.push({
            "source": graph.nodes[2],
            "target": graph.nodes[1]
        });
        graph.edges.push({
            "source": graph.nodes[3],
            "target": graph.nodes[1]
        });
        graph.updateGraph();
    });

// FUNCTIONS

function getNode(id) {
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