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
            if ( tempnode == aNode.cameFrom ) {
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
        this.nextIteration = false;
        var result = this.search.isNextStep(node);
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
	},

    findLink: function(node){
        return this.search.findLink(node);
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
var currentIter = [];
var currentPaths = [];

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
createGraph({"nodes":[{"id":3,"title":"A","x":430,"y":86},{"id":4,"title":"B","x":209,"y":244},{"id":5,"title":"C","x":434,"y":246},{"id":6,"title":"D","x":648,"y":243},{"id":7,"title":"E","x":89,"y":402},{"id":8,"title":"F","x":287,"y":407}],"edges":[{"source":3,"target":5,"id":"pathId0","weight":""},{"source":3,"target":4,"id":"pathId1","weight":""},{"source":3,"target":6,"id":"pathId2","weight":""},{"source":4,"target":8,"id":"pathId3","weight":""},{"source":4,"target":7,"id":"pathId4","weight":""}]},3,8);

// LISTENERS
document.getElementById("drawing").addEventListener("click", function(){
    startNode = endNode = null;
    graph.deleteGraph(true);
    graphType = GraphType.iterative_depth_first;
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
        var n = getNode(d.id);
        if (endNode == n) {
            window.parent.$("#title").html("Warning!");
            window.parent.$("#text").html("Begin and end node can't be the same!");
            window.parent.$("#myModal").modal("show");
            return;
        }
        startNode = n;
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
        var n = getNode(d.id);
        if (startNode == n) {
            window.parent.$("#title").html("Warning!");
            window.parent.$("#text").html("Begin and end node can't be the same!");
            window.parent.$("#myModal").modal("show");
            return;
        }
        endNode = n;
        if (d3endNode != null) {
            d3endNode.select("circle")[0][0].setAttribute("style", "stroke-width:2px");
        }
        d3node.select("circle")[0][0].setAttribute("style", "stroke-width:5px");
        d3endNode = d3node;
        if (startNode != null) {
            document.getElementById("startgame").removeAttribute("disabled");
        }
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
        console.log(result);
        if (result instanceof Array) {
            for(var j = result.length -1; j > 0; j--){
                l1 = result[j];
                document.getElementById("c"+l1.id).getElementsByTagName("circle")[0].style.fill = "#83d675";
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
            document.getElementById("c"+result[0].id).getElementsByTagName("circle")[0].style.fill = "#83d675";
            d3node.select("circle")[0][0].style.fill = "#83d675";
            window.parent.$("#title").html("Congratulations!");
            window.parent.$("#text").html("Now try more advanced graphs, draw your own graphs, or exchange graphs with your friends.");
            window.parent.$("#myModal").modal("show");
            GraphCreator.prototype.circleMouseUp = function() {}
            currentIter = [];
            currentPaths = [];
        } else if (result) {
            var l = search.findLink(clickedNode);
            if( l != undefined ){
                for (var i = graph.edges.length - 1; i >= 0; i--) {
                    e = graph.edges[i];
                    if( (e.source.id == l.node.id && e.target.id == clickedNode.id) || (e.target.id == l.node.id && e.source.id == clickedNode.id)){
                        edg = graph.edges[i];
                        break;
                    }

                }
                document.getElementById(edg.id).style.stroke = "#9bafd7";
            }
            var clickedCirc = d3node.select("circle"); 
            clickedCirc[0][0].style.fill = "#9bafd7";        
            
            if(currentIter[clickedNode.depth] == undefined){
                currentIter[clickedNode.depth] = []
            }
            currentIter[clickedNode.depth].push(d3node); // end animation circle select
            //console.log(currentIter)

            if( l != undefined ){
                var selectedPath = d3.select("#"+edg.id);
                if(currentPaths[clickedNode.depth - 1] == undefined){
                    currentPaths[clickedNode.depth - 1] = [];
                }
                currentPaths[clickedNode.depth - 1].push(selectedPath);
            }
            //console.log(currentPaths);


            if(search.pathDoesntExist){
                window.parent.$("#title").html("Warning!");
                window.parent.$("#text").html("There is no path between start and end nodes!<br>Try starter graph if you are confused.");
                window.parent.$("#myModal").modal("show");
                GraphCreator.prototype.circleMouseUp = function() {}
            }
            if(search.nextIteration) {
                console.log(currentIter.length);
                fadeOut();
                //d3.selectAll("path").style("stroke","#333");
                currentIter = [];
                currentPaths = [];
            }
        } else {
            var color;
            var clickedCircle = d3node.select("circle");
            console.log(clickedCircle[0][0]);
            color = clickedCircle[0][0].style.getPropertyValue("fill");
            console.log(color);
            wrongAnimation(d3node.select("circle"),color);

        }
    }

    document.getElementById("selectstart").style.display = "none";
    document.getElementById("selectend").style.display = "none";
    document.getElementById("startgame").style.display = "none";

    search = new IterativeDepthFirstSearch(startNode, endNode);
    if(search.pathDoesntExist){
        window.parent.$("#title").html("Warning!");
        window.parent.$("#text").html("There is no path between start and end nodes!<br>Try starter graph if you are confused.");
        window.parent.$("#myModal").modal("show");
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
		createGraph({"nodes":[{"id":3,"title":"A","x":430,"y":86},{"id":4,"title":"B","x":209,"y":244},{"id":5,"title":"C","x":434,"y":246},{"id":6,"title":"D","x":648,"y":243},{"id":7,"title":"E","x":89,"y":402},{"id":8,"title":"F","x":287,"y":407}],"edges":[{"source":3,"target":5,"id":"pathId0","weight":""},{"source":3,"target":4,"id":"pathId1","weight":""},{"source":3,"target":6,"id":"pathId2","weight":""},{"source":4,"target":8,"id":"pathId3","weight":""},{"source":4,"target":7,"id":"pathId4","weight":""}]},3,8);
	}
);

document.getElementById("graph2").addEventListener("click",
	function(){
		createGraph({"nodes":[{"id":3,"title":"A","x":98,"y":102},{"id":4,"title":"B","x":535,"y":306},{"id":5,"title":"C","x":311,"y":304},{"id":6,"title":"D","x":316,"y":103},{"id":7,"title":"E","x":647,"y":210},{"id":8,"title":"F","x":102,"y":304},{"id":9,"title":"G","x":533,"y":466},{"id":10,"title":"H","x":534,"y":101}],"edges":[{"source":3,"target":6,"id":"pathId0","weight":""},{"source":5,"target":10,"id":"pathId2","weight":""},{"source":6,"target":4,"id":"pathId4","weight":""},{"source":5,"target":9,"id":"pathId5","weight":""},{"source":10,"target":7,"id":"pathId6","weight":""},{"source":4,"target":7,"id":"pathId7","weight":""},{"source":3,"target":8,"id":"pathId8","weight":""},{"source":8,"target":5,"id":"pathId9","weight":""}]},3,7);
	}
);

document.getElementById("graph3").addEventListener("click",
	function(){
		createGraph({"nodes":[{"id":3,"title":"A","x":730,"y":362},{"id":4,"title":"B","x":461,"y":77},{"id":5,"title":"C","x":371,"y":517},{"id":6,"title":"D","x":461,"y":302},{"id":7,"title":"E","x":144,"y":369},{"id":10,"title":"H","x":706,"y":517},{"id":11,"title":"I","x":199,"y":512},{"id":12,"title":"J","x":278,"y":173},{"id":13,"title":"K","x":634,"y":171},{"id":14,"title":"L","x":532,"y":520}],"edges":[{"source":6,"target":4,"id":"pathId0","weight":""},{"source":6,"target":10,"id":"pathId1","weight":""},{"source":6,"target":11,"id":"pathId2","weight":""},{"source":11,"target":7,"id":"pathId3","weight":""},{"source":11,"target":5,"id":"pathId4","weight":""},{"source":3,"target":10,"id":"pathId5","weight":""},{"source":4,"target":13,"id":"pathId11","weight":""},{"source":4,"target":12,"id":"pathId12","weight":""},{"source":14,"target":10,"id":"pathId13","weight":""}]},3,7);
	}
);

// FUNCTIONS
function createGraph(json,start,end){
	if(!this.graph.nodes === []){
		return;
	}
    GraphCreator.prototype.svgKeyDown = function() {};
    GraphCreator.prototype.svgMouseUp = function() {};
    GraphCreator.prototype.circleMouseDown = function() {};
    GraphCreator.prototype.dragmove = function(d) {};
    GraphCreator.prototype.pathMouseDown = function() {};
	var starterGraph = json;
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
        d3startNode = d3.select("#c"+start);
        d3endNode = d3.select("#c"+end);
        document.getElementById("c"+start).getElementsByTagName("circle")[0].setAttribute("style", "stroke-width:5px");
		document.getElementById("c"+start).getElementsByTagName("circle")[0].style.fill = "#9bafd7";
		document.getElementById("c"+end).getElementsByTagName("circle")[0].setAttribute("style", "stroke-width:5px");
		document.getElementById("enddrawing").style.display = "none";
		document.getElementById("startgame").style.display = "inline-block";
		document.getElementById("startgame").removeAttribute("disabled");
}

function getNode(id) {
    for (var i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].id == id) {
            return nodes[i];
        }
    }
    return null;
}

function wrongAnimation(node,color){
    var myCol ;
    if(color == null){
        myCol = "#F6FBFF";
    }else{
        myCol = color;
    }
    node
    .attr("pointer-events", "none")
    .transition()
    .style("fill","red")
    .duration(125)
    .transition()
    .style("fill",myCol)
    .duration(125)
    .transition()
    .style("fill","red")
    .duration(125)
    .transition()
    .style("fill",myCol)
    .duration(125)
    .each("end", function() { d3.select(this).attr("pointer-events", null); });
}

function fadeOut(){
    for(var i = currentIter.length -1 ; i>=0 ; i--){
        for(var j = currentIter[i].length -1; j>=0; j--){
            currentIter[i][j].select("circle")
            .attr("pointer-events", "none")
            .transition()
            .delay(500*(currentIter.length -(i+1)))
            .style("fill","#F6FBFF")
            .duration(500)
            .each("end", function() { d3.select(this).attr("pointer-events", null); });
            if(i > 0){
                var dimentions = currentPaths[i-1][j].attr("d");
                var temp = currentIter[i][j].attr("transform").split("(");
                var endPoint = temp[1].substring(0, temp[1].length - 1)
                console.log(dimentions +"--"+ endPoint);
                
                var parts = dimentions.split("L");
                
                currentPaths[i-1][j][0][0].style.stroke = "#333";

                if( endPoint == parts[1]){
                    var newPath = d3.select("#paths")
                    .append("path")
                    .classed("link", true)
                    .attr("d", dimentions);
                    newPath[0][0].style.stroke = "#9bafd7";
                    dimentions = "M"+parts[0].substr(1)+"L"+parts[0].substr(1)
                } else if( endPoint == parts[0].substr(1) ){
                    dimentions = "M"+parts[1]+"L"+endPoint;
                    var newPath = d3.select("#paths")
                    .append("path")
                    .classed("link", true)
                    .attr("d", dimentions);
                    newPath[0][0].style.stroke = "#9bafd7";
                    dimentions = "M"+parts[1]+"L"+parts[1];

                }  

                newPath.transition().delay(500*(currentIter.length -(i+1)))
                .attr("pointer-events", "none")
                .attr("d",dimentions)
                .duration(500)
                .ease("linear")
                .each("end", function() { d3.select(this).attr("pointer-events", null); })
                .remove();             
            }
        }
    }

}