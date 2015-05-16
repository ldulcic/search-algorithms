// -------------------------------------------
//                 OBJECTS
// -------------------------------------------
// ---------------- NODE ----------------
function Node(x, y, id) {
    this.id = id;
    this.x = x;
    this.y = y;
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
    this.openNodes = [];
    this.visited = [startNode];
    this.expand(startNode.expand());
    this.nextSteps = this.getNext();
}

Dijkstra.prototype = {
    constructor: Dijkstra,

    inNextSteps: function(node) {
        if (node == endNode && this.nextSteps.indexOf(endNode) != -1) {
            return "kraj";
        }

        var index = this.nextSteps.indexOf(node);
        if (index == -1) {
            return false;
        }

        this.expand(node.expand());
        this.nextSteps.splice(index, 1);
        this.visited.push(node);

        if (this.nextSteps.length == 0) {
            for (var i = this.nextSteps.length - 1; i >= 0; i--) {
                this.addToOpen(this.nextSteps[i]);
            }
            this.nextSteps = this.getNext();
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
graph.setIdCt(2);
graph.updateGraph();

// LISTENERS
document.getElementById("selectstart").addEventListener("click", function() {
    GraphCreator.prototype.circleMouseUp = function(d3node, d) {
        startNode = getNode(d.id);
        if (d3startNode != null) {
            d3startNode[0][0].setAttribute("stroke", "black");
        }
        d3node[0][0].setAttribute("stroke", "green");
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
            d3endNode[0][0].setAttribute("stroke", "black");
        }
        d3node[0][0].setAttribute("stroke", "red");
        d3endNode = d3node;
        document.getElementById("startgame").removeAttribute("disabled");
    }
});

document.getElementById("startgame").addEventListener("click", function() {
    GraphCreator.prototype.circleMouseUp = function(d3node, d) {
        clickedNode = getNode(d.id);
        var result = dijkstra.inNextSteps(clickedNode);
        if (result == "kraj") {
            window.alert("dobro je, ne pritsci vise nista!");
        } else if (result) {
            window.alert("TOO KRALJUU!");
        } else {
            window.alert("DEBILU!");
        }
    }

    document.getElementById("selectstart").setAttribute("disabled", "");
    document.getElementById("selectend").setAttribute("disabled", "");

    dijkstra = new Dijkstra(startNode, endNode);
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

    document.getElementById("enddrawing").setAttribute("disabled", "");
    document.getElementById("selectstart").removeAttribute("disabled");

});

document.getElementById("graph1").addEventListener("click",
    function() {
		createGraph('{"nodes":[{"id":2,"title":"A","x":161,"y":327},{"id":3,"title":"B","x":462,"y":131},{"id":4,"title":"C","x":470,"y":507},{"id":5,"title":"D","x":759,"y":311}],"edges":[{"source":2,"target":3,"id":"pathId4","weight":8},{"source":2,"target":4,"id":"pathId5","weight":7},{"source":4,"target":5,"id":"pathId6","weight":11},{"source":3,"target":5,"id":"pathId7","weight":9}]}');
		d3startNode = jsonObj.nodes[0];
		d3endNode = jsonObj.nodes[3];
	});

document.getElementById("graph2").addEventListener("click",
	function() {
		createGraph('{"nodes":[{"id":2,"title":"A","x":69,"y":358},{"id":3,"title":"B","x":342,"y":141},{"id":4,"title":"C","x":305,"y":527},{"id":5,"title":"D","x":661,"y":151},{"id":6,"title":"E","x":652,"y":533},{"id":7,"title":"F","x":887,"y":355}],"edges":[{"source":6,"target":7,"id":"pathId5","weight":8},{"source":5,"target":7,"id":"pathId6","weight":11},{"source":2,"target":3,"id":"pathId7","weight":5},{"source":2,"target":4,"id":"pathId8","weight":6},{"source":4,"target":5,"id":"pathId9","weight":4},{"source":3,"target":6,"id":"pathId10","weight":9}]}');
	});	
	
document.getElementById("graph3").addEventListener("click",
	function(){
		createGraph('{"nodes":[{"id":2,"title":"A","x":74.45531463623047,"y":322.34893798828125},{"id":3,"title":"B","x":341,"y":82},{"id":4,"title":"C","x":341.5149230957031,"y":546.2425537109375},{"id":5,"title":"D","x":583.5303344726562,"y":312.2580261230469},{"id":6,"title":"E","x":820.8936767578125,"y":96.4154281616211},{"id":7,"title":"F","x":818.5485229492188,"y":534.31884765625},{"id":8,"title":"G","x":578.7913818359375,"y":745.9552001953125},{"id":9,"title":"H","x":592.5692749023438,"y":-124.37584686279297},{"id":10,"title":"I","x":1048.2547607421875,"y":329.43511962890625}],"edges":[{"source":6,"target":10,"id":"pathId11","weight":1},{"source":2,"target":3,"id":"pathId12","weight":10},{"source":2,"target":4,"id":"pathId13","weight":5},{"source":3,"target":5,"id":"pathId14","weight":2},{"source":3,"target":9,"id":"pathId15","weight":14},{"source":4,"target":5,"id":"pathId16","weight":20},{"source":4,"target":8,"id":"pathId17","weight":9},{"source":8,"target":7,"id":"pathId18","weight":11},{"source":5,"target":7,"id":"pathId19","weight":8},{"source":7,"target":10,"id":"pathId20","weight":3},{"source":5,"target":6,"id":"pathId21","weight":12},{"source":9,"target":6,"id":"pathId22","weight":15}]}');
	});
	
// FUNCTIONS

function createGraph(json){
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
		var starterGraph = JSON.parse(json);
        graph.deleteGraph(true);
		var jsonObj = starterGraph;
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
}

function getNode(id) {
    for (var i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].id == id) {
            return nodes[i];
        }
    }
    return null;
}