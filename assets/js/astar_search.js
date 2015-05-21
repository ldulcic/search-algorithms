// -------------------------------------------
//                 OBJECTS
// -------------------------------------------
// ---------------- NODE ----------------
function Node(x, y, id, title) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.title = title;
    this.cameFrom = null;
    this.links = [];
}

Node.prototype = {

    value: Number.MIN_VALUE,

    heuristicValue: Number.MIN_VALUE,

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
        var newNode;

        for (var i = this.links.length - 1; i >= 0; i--) {
            node = this.links[i].node;
            newNode = new Node(node.x, node.y, node.id, node.title);
            newNode.links = node.links;
            newNode.value = node.value;
            newNode.cameFrom = node.cameFrom;

            var value = parseInt(this.value) + parseInt(this.links[i].value);
            if (newNode.value == Number.MIN_VALUE || newNode.value > value) {
                newNode.value = value;
                newNode.cameFrom = this;
            }
            
            nodes.push(newNode);
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

//------------------ASTAR-----------------
function AStarSearch(startNode, endNode) {
    this.startNode = startNode;
    this.startNode.value = 0;
    this.startNode.heuristicValue = heuristics[this.startNode.title];
    this.endNode = endNode;
    this.pathDoesntExist = false;
    this.openNodes = [];
    this.visited = [this.startNode];
    this.nextSteps = []

    this.expand(this.startNode);
    this.nextSteps = this.getNext();
    if(this.nextSteps == null) {
        this.pathDoesntExist = true;
    }
}

AStarSearch.prototype = {
    constructor: AStarSearch,

    isNextStep: function(node) {
        var index = this.indexOfNode(this.nextSteps, node);
        if (node == endNode && index != -1) {
            return this.reconstructPath(this.nextSteps[index]);
        }

        if (index == -1) {
            return false;
        }

        this.expand(this.nextSteps[index]);
        this.visited.push(this.nextSteps[index]);

        this.nextSteps.splice(index, 1);
        for (var i = this.nextSteps.length - 1; i >= 0; i--) {
            this.addToOpen(this.nextSteps[i]);
        }

        this.nextSteps = this.getNext();
        if(this.nextSteps == null) {
            this.pathDoesntExist = true;
        }
        
        return true;
    },

    expand: function(node) {
        var nodes = node.expand();
        var index = 0;
        for (var i = nodes.length - 1; i >= 0; i--) {
            if(this.indexOfNode(this.visited, nodes[i]) == -1) {
                nodes[i].heuristicValue = nodes[i].value + heuristics[nodes[i].title];//heuristics is defined in graph-creator.js
                
                index = this.indexOfNode(this.openNodes, nodes[i]);
                if (index == -1) {
                    this.addToOpen(nodes[i]);
                } else if(this.openNodes[index].value > nodes[i].value) {
                    this.openNodes.splice(index, 1);
                    this.addToOpen(nodes[i]);
                }
            }
        }
    },

    getNext: function() {
        while (this.openNodes.length != 0) {
            var possibleNext = [];
            var tmp = this.openNodes.pop();

            var index = this.indexOfNode(this.visited, tmp);
            if (index == -1) {
                possibleNext.push(tmp);
                for (var i = this.openNodes.length - 1; i >= 0; i--) {

                    if (this.indexOfNode(this.visited, this.openNodes[i]) != -1) {
                        this.openNodes.pop();
                        continue;
                    }

                    if (this.openNodes[i].heuristicValue == tmp.heuristicValue) {
                        var node = this.openNodes.pop();
                        if (this.indexOfNode(possibleNext, node) == -1) {
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

        if (node.heuristicValue > this.openNodes[0].heuristicValue) {
            this.openNodes.splice(0, 0, node);
            return;
        }

        for (var i = this.openNodes.length - 1; i >= 0; i--) {
            if (this.openNodes[i].heuristicValue >= node.heuristicValue) {
                this.openNodes.splice(i + 1, 0, node);
                break;
            }
        }
    },

    pathMaxCorrection: function (value1, value2) {
        if(value1 > value2) {
            return value1;
        } else {
            return value2;
        }
    },

    findLink: function(aNode) {
        aNode = this.findNode(aNode.id);
        var prevNode;
        var tempnode;
        for (var i = aNode.links.length - 1; i >= 0; i--) {
            tempnode = aNode.links[i].node;
            if (tempnode.id == aNode.cameFrom.id) {
                prevNode = aNode.links[i];
                break;
            }
        }
        return prevNode;
    },

    findNode: function (nodeId) {
        for (var i = this.visited.length - 1; i >= 0; i--) {
            if(this.visited[i].id == nodeId) {
                return this.visited[i];
            }
        }
        return null;
    },

    indexOfNode: function (array, node) {
        var length = array.length;
        for (var i = 0; i < length; i++) {
            if(array[i].id == node.id) {
                return i;
            }
        }
        return -1; 
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
var search = null;

graphType = GraphType.astar;

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
createGraph({"nodes":[{"id":3,"title":"A","x":430,"y":86},{"id":4,"title":"B","x":209,"y":244},{"id":5,"title":"C","x":434,"y":246},{"id":6,"title":"D","x":648,"y":243},{"id":7,"title":"E","x":89,"y":402},{"id":8,"title":"F","x":287,"y":407}],"edges":[{"source":3,"target":5,"id":"pathId0","weight":""},{"source":3,"target":4,"id":"pathId1","weight":""},{"source":3,"target":6,"id":"pathId2","weight":""},{"source":4,"target":8,"id":"pathId3","weight":""},{"source":4,"target":7,"id":"pathId4","weight":""}]},3,8)


// LISTENERS
document.getElementById("drawing").addEventListener("click", function(){
    nodes = [];
    startNode = endNode = null;
    graph.deleteGraph(true);
    graph.setIdCt(2);
    graph.updateGraph();
    
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
    d3startNode.on("mouseup",null);
    GraphCreator.prototype.circleMouseUp = function(d3node, d) {
        clickedNode = getNode(d.id);
        var edg;
        var l1;
        var l2;
        var e;
        var result = search.isNextStep(clickedNode);

        if (result instanceof Array) {
            console.log(result);
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
        } else if (result) {
            l = search.findLink(clickedNode);
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
                window.parent.$("#title").html("Warning!");
                window.parent.$("#text").html("There is no path between start and end nodes!<br>Try starter graph if you are confused.");
                window.parent.$("#myModal").modal("show");
                GraphCreator.prototype.circleMouseUp = function() {}
            }        
        } else {
            wrongAnimation(d3node.select("circle"));

        }
    }

    document.getElementById("selectstart").style.display = "none";
    document.getElementById("selectend").style.display = "none";
    document.getElementById("startgame").style.display = "none";
    
    search = new AStarSearch(startNode, endNode);
    if(search.pathDoesntExist){
        window.parent.$("#title").html("Warning!");
        window.parent.$("#text").html("There is no path between start and end nodes!<br>Try starter graph if you are confused.");
        window.parent.$("#myModal").modal("show");
        GraphCreator.prototype.circleMouseUp = function() {}
    }
});

document.getElementById("enddrawing").addEventListener("click", function() {
    var n;
    disableDrawing();
    for (var i = graph.nodes.length - 1; i >= 0; i--) {
        n = graph.nodes[i];
        nodes.push(new Node(n.x, n.y, n.id, n.title));
    }

    var source, target, e;
    for (var i = graph.edges.length - 1; i >= 0; i--) {
        e = graph.edges[i];
        source = getNode(e.source.id);
        target = getNode(e.target.id);
        source.addLink(new Link(target, e.weight));
        target.addLink(new Link(source, e.weight));
    }

    document.getElementById("check-form").style.display = "inline-block";
    document.getElementById("enddrawing").style.display = "none";
    document.getElementById("selectstart").style.display = "inline-block";
    document.getElementById("selectend").style.display = "inline-block";
    document.getElementById("startgame").style.display = "inline-block";
    document.getElementById("startgame").setAttribute("disabled", "");
    
    
    if(table === undefined || table == null) {
        dataset.rowLabel = ["Nodes"];
        dataset.columnLabel = ['Heuristic values'];
        dataset.value = [];
        
        for(var i = 0; i < nodes.length; i++) {
            dataset.rowLabel.splice(1, 0, nodes[i].title);
            dataset.value.push("-");
        }
        
        nodeTitles = dataset.rowLabel;
        graph.createTable();
    }
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
    var starterGraph = json;
        graph.deleteGraph(true);
        GraphCreator.prototype.svgKeyDown = function() {};
        GraphCreator.prototype.svgMouseUp = function() {};
        GraphCreator.prototype.circleMouseDown = function() {};
        GraphCreator.prototype.dragmove = function(d) {};
        GraphCreator.prototype.pathMouseDown = function() {};
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
            nodes.push(new Node(n.x, n.y, n.id, n.title));
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

function disableDrawing(){
    GraphCreator.prototype.svgKeyDown = function() {}
    GraphCreator.prototype.svgMouseUp = function() {}
    GraphCreator.prototype.circleMouseDown = function() {}
    GraphCreator.prototype.dragmove = function(d) {}
    GraphCreator.prototype.pathMouseDown = function() {}
    GraphCreator.prototype.circleMouseUp = function() {}
}

document.getElementById("delete-graph").addEventListener("click", function() {
   nodes = [];
   startNode = endNode = null;
});