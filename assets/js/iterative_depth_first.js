// -------------------------------------------
//                 OBJECTS
// -------------------------------------------
// ---------------- NODE ----------------
function Node(x, y, id) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.depth;
    this.cameFrom = null;
    this.links = [];
}

Node.prototype = {

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

// ---------------- DEPTH FIRST ----------------
function DepthFirstSearch (startNode, endNode, depth, iterative) {
    this.startNode = startNode;
    if(depth !== undefined) this.startNode.depth = 0;
    this.endNode = endNode;
    this.maxDepth = depth;
    this.maxDepthTooSmall = [];
    this.openedNodes = [];
    this.visited = [startNode];
    this.pathDoesntExist = false;
    
    if((depth !== undefined && depth == 0) || iterative !== undefined) {//iterative means we are using this search as a helper in iterative depth first
        this.nextStep = startNode;
        this.maxDepthTooSmall.push(new Node(0, 0, 0));//dummy node, it is added so function isDepthTooSmall would return true
        return;
    }

    var nodes = this.startNode.expand();
    for (var i = nodes.length - 1; i >= 0; i--) {
        nodes[i].cameFrom = this.startNode;
    }

    if(depth !== undefined) {
        this.expand(nodes, this.startNode.depth + 1);
    } else {
        this.expand(nodes);
    }

    if(this.openedNodes.length == 0) {
        this.pathDoesntExist = true;
    } else {
        this.nextStep = this.openedNodes.pop();
    }
}

DepthFirstSearch.prototype = {
    
    constructor: DepthFirstSearch,

    isNextStep: function (node) {
        if(this.nextStep == endNode && node == endNode) {
            return this.reconstructPath(node);
        }

        if(this.nextStep != node) {
            return false;
        }

        this.visited.push(node);

        if(this.maxDepth === undefined || node.depth < this.maxDepth) {
            var nodes = node.expand();
            for (var i = nodes.length - 1; i >= 0; i--) {
                if(this.visited.indexOf(nodes[i]) == -1) {
                    nodes[i].cameFrom = node;
                }
            }

            if(this.maxDepth !== undefined) {
               this.expand(nodes, node.depth + 1);
            } else {
                this.expand(nodes);
            }
        } else {
            var nodes = node.expand();
            for (var i = nodes.length - 1; i >= 0; i--) {
                if(this.visited.indexOf(nodes[i]) == -1) {
                    this.maxDepthTooSmall.push(nodes[i]);
                }
            }
        }
        
        if(this.openedNodes.length == 0) {
            this.pathDoesntExist = true;
        } else {
            this.nextStep = this.getNext();
            if(this.nextStep == null) {
                this.pathDoesntExist = true;
            }
        }
        
        return true;
    },

    expand: function (nodes, depth) {
        nodes.sort(function (a, b) {
            if(a.id < b.id) {
                return -1;
            } else if(a.id > b.id) {
                return 1;
            } else {
                return 0;
            }
        });

        for (var i = nodes.length - 1; i >= 0; i--) {
            if(this.visited.indexOf(nodes[i]) == -1) {
                if(depth !== undefined) nodes[i].depth = depth;
                this.openedNodes.push(nodes[i]); 
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
    },

    isDepthTooSmall: function () {
        for (var i = this.maxDepthTooSmall.length - 1; i >= 0; i--) {
            if(this.visited.indexOf(this.maxDepthTooSmall[i]) == -1) {
                return true;
            }
        }
        return false;
    }
}

// ---------------- ITERATIVE DEPTH FIRST ----------------
function IterativeDepthFirstSearch (startNode, endNode) {
	this.startNode = startNode;
	this.endNode = endNode;
    this.depth = 0;
    this.nextIteration = false;
    this.search = new DepthFirstSearch(startNode, endNode, this.depth, true);
	this.pathDoesntExist = false;
}

IterativeDepthFirstSearch.prototype = {
	
	constructor: IterativeDepthFirstSearch,

	isNextStep: function (node) {
        var result = this.search.isNextStep(node);
        console.log(result);
        if(result instanceof Array) {
            return result;
        } else if(result) {
            if(this.search.pathDoesntExist) {
                if(this.search.isDepthTooSmall()) {
                    this.search = new DepthFirstSearch(this.startNode, this.endNode, ++this.depth, true);
                    this.nextIteration = true;
                } else {
                    this.pathDoesntExist = true;
                }
            }
            return true;
        } else {
            return false;
        }
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

graphType = GraphType.depth_first;

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
        d3node.select("circle")[0][0].style.fill = "GreenYellow ";
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
        var edg;
        var l;
        var e;
        var result = search.isNextStep(clickedNode);

        if (result instanceof Array) {
            /*l = dijkstra.findLink(clickedNode);
            for (var i = graph.edges.length - 1; i >= 0; i--) {
                e = graph.edges[i];
                if( (e.source.id == l.node.id && e.target.id == clickedNode.id) || (e.target.id == l.node.id && e.source.id == clickedNode.id)){
                    edg = graph.edges[i];
                    break;
                }
            }
            document.getElementById(edg.id).style.stroke = "green"; 
            d3node.select("circle")[0][0].style.fill = "GreenYellow ";*/
            window.alert("dobro je, ne pritsci vise nista!");
            console.log(result);
            //console.log(result);
        } else if (result) {
           /* l = search.findLink(clickedNode);
            for (var i = graph.edges.length - 1; i >= 0; i--) {
                e = graph.edges[i];
                if( (e.source.id == l.node.id && e.target.id == clickedNode.id) || (e.target.id == l.node.id && e.source.id == clickedNode.id)){
                    edg = graph.edges[i];
                    break;
                }

            }
            document.getElementById(edg.id).style.stroke = "green";*/ 
            d3node.select("circle")[0][0].style.fill = "GreenYellow ";
            if(search.nextIteration) {
                d3.selectAll("circle").style("fill", "white");
            }
        } else {
            wrongAnimation(d3node.select("circle"));

        }
    }

    document.getElementById("selectstart").setAttribute("disabled", "");
    document.getElementById("selectend").setAttribute("disabled", "");

    search = new IterativeDepthFirstSearch(startNode, endNode);
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

    var dataset = {
    rowLabel: ['Heuristic values', 'A', 'B', 'C', 'D'],
    columnLabel: ['P'],
    value: [[1], [5], [9], [13], [17]]
    };
                        
    var width = 300;
    var height = 200;

    var table = Table().width(width).height(height);

    d3.select('svg')
        .datum(dataset)
        .call(table);
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