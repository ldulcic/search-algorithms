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
createGraph({"nodes":[{"id":3,"title":"A","x":430,"y":86},{"id":4,"title":"B","x":209,"y":244},{"id":5,"title":"C","x":434,"y":246},{"id":6,"title":"D","x":648,"y":243},{"id":7,"title":"E","x":89,"y":402},{"id":8,"title":"F","x":287,"y":407}],"edges":[{"source":3,"target":5,"id":"pathId0","weight":""},{"source":3,"target":4,"id":"pathId1","weight":""},{"source":3,"target":6,"id":"pathId2","weight":""},{"source":4,"target":8,"id":"pathId3","weight":""},{"source":4,"target":7,"id":"pathId4","weight":""}]},3,8)


// LISTENERS
document.getElementById("drawing").addEventListener("click", function(){
	graph.deleteGraph(true);
	graphType = GraphType.depth_first;
	graph.setIdCt(2);
	graph.updateGraph();	
   	document.getElementById("startgame").style.display = "none";
	document.getElementById("enddrawing").style.display = "inline-block";
	
	GraphCreator.prototype.circleMouseUp = function(d3node, d) {    var thisGraph = this,
        state = thisGraph.state,
        consts = thisGraph.consts;
    // reset the states
    state.shiftNodeDrag = false;
    d3node.classed(consts.connectClass, false);

    var mouseDownNode = state.mouseDownNode;

    if (!mouseDownNode) return;

    thisGraph.dragLine.classed("hidden", true);

    if (mouseDownNode !== d) {
        // we're in a different node: create new edge for mousedown edge and add to graph
        var newEdge = {
            source: mouseDownNode,
            target: d,
            id: "pathId" + counter++,
            weight: 1
        };
        var filtRes = thisGraph.paths.filter(function(d) {
            if (d.source === newEdge.target && d.target === newEdge.source) {
                thisGraph.edges.splice(thisGraph.edges.indexOf(d), 1);
            }
            return d.source === newEdge.source && d.target === newEdge.target;
        });
        if (!filtRes[0].length) {
            thisGraph.edges.push(newEdge);
            thisGraph.updateGraph();
            
            if(graphType != GraphType.depth_first && graphType != GraphType.breadth_first) {
                var d3text = this.changeWeightOfLink(d3.select("#pathId" + (counter - 1)), newEdge);
                var txtNode = d3text.node();
                thisGraph.selectElementContents(txtNode);
                txtNode.focus();
            }
        }
    } else {
        // we're in the same node
        if (state.justDragged) {
            // dragged, not clicked
            state.justDragged = false;
        } else {
            // clicked, not dragged
            if (d3.event.shiftKey && graphType != GraphType.depth_first && graphType != GraphType.breadth_first) {
                // shift-clicked node: edit text content
                var d3txt = thisGraph.changeTextOfNode(d3node, d);
                var txtNode = d3txt.node();
                thisGraph.selectElementContents(txtNode);
                txtNode.focus();
            } else {
                if (state.selectedEdge) {
                    thisGraph.removeSelectFromEdge();
                }
                var prevNode = state.selectedNode;

                if (!prevNode || prevNode.id !== d.id) {
                    thisGraph.replaceSelectNode(d3node, d);
                } else {
                    thisGraph.removeSelectFromNode();
                }
            }
        }
    }
    state.mouseDownNode = null;
    return;};
	//restartanje listenera
	GraphCreator.prototype.svgKeyDown = function() {
		var thisGraph = this,
        state = thisGraph.state,
        consts = thisGraph.consts;
    // make sure repeated key presses don't register for each keydown
    if (state.lastKeyDown !== -1) return;

    state.lastKeyDown = d3.event.keyCode;
    var selectedNode = state.selectedNode,
        selectedEdge = state.selectedEdge;

    switch (d3.event.keyCode) {
        case consts.BACKSPACE_KEY:
        case consts.DELETE_KEY:
            d3.event.preventDefault();
            if (selectedNode) {
                thisGraph.nodes.splice(thisGraph.nodes.indexOf(selectedNode), 1);
                thisGraph.spliceLinksForNode(selectedNode);
                state.selectedNode = null;
                thisGraph.updateGraph();
            } else if (selectedEdge) {
                thisGraph.edges.splice(thisGraph.edges.indexOf(selectedEdge), 1);

                d3.select("#textId" + selectedEdge.id.substring(6, selectedEdge.id.length))
                    .select(function() {
                        return this.parentNode;
                    }).remove();

                state.selectedEdge = null;
                thisGraph.updateGraph();
            }
            break;
    }
};
    GraphCreator.prototype.svgMouseUp = function() {var thisGraph = this,
        state = thisGraph.state;
    if (state.justScaleTransGraph) {
        // dragged not clicked
        state.justScaleTransGraph = false;
    } else if (state.graphMouseDown && d3.event.shiftKey) {
        // clicked not dragged from svg
        if (titleIndex == consts.defaultTitle.length) {
            titleIndex = 0;
        }

        //novo
        var title = "";
        var letter = String.fromCharCode(consts.defaultTitle++);
        for (var i = 0; i < consts.numOfLettersInTitle; i++) {
            title += letter;
        }
        if(consts.defaultTitle == "Z".charCodeAt() + 1) {
            consts.defaultTitle = "A".charCodeAt();
            consts.numOfLettersInTitle++;
        }
        //novo

        var xycoords = d3.mouse(thisGraph.svgG.node()),
            d = {
                id: ++thisGraph.idct,
                title: title,
                x: xycoords[0],
                y: xycoords[1]
            };
        thisGraph.nodes.push(d);
        thisGraph.updateGraph();
        // make title of text immediently editable
        
        if(graphType != GraphType.depth_first && graphType != GraphType.breadth_first) {
            var d3txt = thisGraph.changeTextOfNode(thisGraph.circles.filter(function(dval) {
                    return dval.id === d.id;
                }), d),
                txtNode = d3txt.node();
            thisGraph.selectElementContents(txtNode);
            txtNode.focus();
        }
    } else if (state.shiftNodeDrag) {
        // dragged from node
        state.shiftNodeDrag = false;
        thisGraph.dragLine.classed("hidden", true);
    }
    state.graphMouseDown = false;
	};
    GraphCreator.prototype.circleMouseDown = function(d3node, d) {var thisGraph = this,
        state = thisGraph.state;
    d3.event.stopPropagation();
    state.mouseDownNode = d;
    if (d3.event.shiftKey) {
        state.shiftNodeDrag = d3.event.shiftKey;
        // reposition dragged directed edge
        thisGraph.dragLine.classed('hidden', false)
            .attr('d', 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + d.y);
        return;
    }};
    GraphCreator.prototype.dragmove = function(d) {var thisGraph = this;
    if (thisGraph.state.shiftNodeDrag) {
        thisGraph.dragLine.attr('d', 'M' + d.x + ',' + d.y + 'L' + d3.mouse(thisGraph.svgG.node())[0] + ',' + d3.mouse(this.svgG.node())[1]);
    } else {
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        thisGraph.updateGraph();
    }};
    GraphCreator.prototype.pathMouseDown = function(d3path, d) {var thisGraph = this,
        state = thisGraph.state;
    d3.event.stopPropagation();
    state.mouseDownLink = d;

    if (state.selectedNode) {
        thisGraph.removeSelectFromNode();
    }

    var prevEdge = state.selectedEdge;
    if (!prevEdge || prevEdge !== d) {
        thisGraph.replaceSelectEdge(d3path, d);
    } else {
        thisGraph.removeSelectFromEdge();
    }}
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
            window.alert("Congratulations!\n\nNow try more advanced graphs, draw your own graphs, or exchange graphs with your friends.");
			createGraph({"nodes":[{"id":3,"title":"A","x":430,"y":86},{"id":4,"title":"B","x":209,"y":244},{"id":5,"title":"C","x":434,"y":246},{"id":6,"title":"D","x":648,"y":243},{"id":7,"title":"E","x":89,"y":402},{"id":8,"title":"F","x":287,"y":407}],"edges":[{"source":3,"target":5,"id":"pathId0","weight":""},{"source":3,"target":4,"id":"pathId1","weight":""},{"source":3,"target":6,"id":"pathId2","weight":""},{"source":4,"target":8,"id":"pathId3","weight":""},{"source":4,"target":7,"id":"pathId4","weight":""}]},3,8)

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
            d3node.select("circle")[0][0].style.fill = "#9bafd7";
            d3node.on("mouseup",null);
            if(search.pathDoesntExist){
                window.alert("There is no path between start and end nodes!\n\nTry starter graph if you are confused.");
				createGraph({"nodes":[{"id":3,"title":"A","x":430,"y":86},{"id":4,"title":"B","x":209,"y":244},{"id":5,"title":"C","x":434,"y":246},{"id":6,"title":"D","x":648,"y":243},{"id":7,"title":"E","x":89,"y":402},{"id":8,"title":"F","x":287,"y":407}],"edges":[{"source":3,"target":5,"id":"pathId0","weight":""},{"source":3,"target":4,"id":"pathId1","weight":""},{"source":3,"target":6,"id":"pathId2","weight":""},{"source":4,"target":8,"id":"pathId3","weight":""},{"source":4,"target":7,"id":"pathId4","weight":""}]},3,8)

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

    search = new DepthFirstSearch(startNode, endNode);
    if(search.pathDoesntExist){
        window.alert("There is no path between start and end nodes!\n\nTry starter graph if you are confused.");
		createGraph({"nodes":[{"id":3,"title":"A","x":430,"y":86},{"id":4,"title":"B","x":209,"y":244},{"id":5,"title":"C","x":434,"y":246},{"id":6,"title":"D","x":648,"y":243},{"id":7,"title":"E","x":89,"y":402},{"id":8,"title":"F","x":287,"y":407}],"edges":[{"source":3,"target":5,"id":"pathId0","weight":""},{"source":3,"target":4,"id":"pathId1","weight":""},{"source":3,"target":6,"id":"pathId2","weight":""},{"source":4,"target":8,"id":"pathId3","weight":""},{"source":4,"target":7,"id":"pathId4","weight":""}]},3,8)

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

});

document.getElementById("graph1").addEventListener("click",
    function() {
		createGraph({"nodes":[{"id":3,"title":"A","x":430,"y":86},{"id":4,"title":"B","x":209,"y":244},{"id":5,"title":"C","x":434,"y":246},{"id":6,"title":"D","x":648,"y":243},{"id":7,"title":"E","x":89,"y":402},{"id":8,"title":"F","x":287,"y":407}],"edges":[{"source":3,"target":5,"id":"pathId0","weight":""},{"source":3,"target":4,"id":"pathId1","weight":""},{"source":3,"target":6,"id":"pathId2","weight":""},{"source":4,"target":8,"id":"pathId3","weight":""},{"source":4,"target":7,"id":"pathId4","weight":""}]},3,8)
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