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
      if(node.value == Number.MIN_VALUE || node.value > value) {
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
function Dijkstra () {
  this.openNodes = [];
  this.visited = [];
  this.path = [];
}

Dijkstra.prototype = {
  constructor: Dijkstra,

  getPath: function (start, end) {
    start.value = 0;
    this.openNodes.push(start);
    var current;

    while(this.openNodes.length > 0) {
      current = this.getNext();
      if(current == null) return this.path;

      if(current == end) {
        this.path.push(current);
        return this.path;
      }

      this.expand(current.expand());
      this.visited.push(current);
      this.path.push(current);
    }
    return this.path;
  },

  expand: function (nodes) {
    for (var i = nodes.length - 1; i >= 0; i--) {
      if(this.visited.indexOf(nodes[i]) == -1) {
        this.addToOpen(nodes[i]);
      }
    }
  },

  getNext: function () {
    while(this.openNodes.length != 0) {
      for (var i = this.openNodes.length - 1; i >= 0; i--) {
        if(this.visited.indexOf(this.openNodes[i]) == -1) {
          return this.openNodes.splice(i, 1)[0];
        }
        this.openNodes.pop();
      }
    }
    return null;
  },

  addToOpen: function (node) {
  	if(this.openNodes.length == 0) {
  		this.openNodes.push(node);
  		return;
  	}

    for (var i = this.openNodes.length - 1; i >= 0; i--) {
      if(this.openNodes[i].value > node.value) {
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

var docEl = document.documentElement,
    bodyEl = document.getElementsByTagName('body')[0];

var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
    height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;

var xLoc = width/2 - 25,
    yLoc = 100;

// MAIN SVG
var svg = d3.select(settings.appendElSpec).append("svg")
      .attr("width", width)
      .attr("height", height);

var graph = new GraphCreator(svg, [], []);
graph.setIdCt(2);
graph.updateGraph();

// LISTENERS
document.getElementById("selectstart").addEventListener("click", function(){
  GraphCreator.prototype.circleMouseUp = function(d3node, d){
    startNode = getNode(d.id);
    if (d3startNode != null) {
      d3startNode[0][0].setAttribute("stroke","black");
    }
    d3node[0][0].setAttribute("stroke","green");
    d3startNode = d3node;
    document.getElementById("selectend").removeAttribute("disabled");
  }

  GraphCreator.prototype.svgKeyDown = function(){
    
  }
  GraphCreator.prototype.svgMouseUp = function(){
    
  }
  GraphCreator.prototype.circleMouseDown = function(){

  }
  GraphCreator.prototype.dragmove = function(d){

  }
  GraphCreator.prototype.pathMouseDown = function(){

  }
});

document.getElementById("selectend").addEventListener("click", function(){
  GraphCreator.prototype.circleMouseUp = function(d3node, d){
    endNode = getNode(d.id);
    if (d3endNode != null) {
      d3endNode[0][0].setAttribute("stroke","black");
    }
    d3node[0][0].setAttribute("stroke","red");
    d3endNode = d3node;
    document.getElementById("startgame").removeAttribute("disabled");
  }
});

document.getElementById("startgame").addEventListener("click", function(){
  GraphCreator.prototype.circleMouseUp = function(d3node, d){
     if(d3node[0][0].getAttribute("fill") != "green"
       && d3node[0][0].getAttribute("fill") != "blue"
       && d3node[0][0].getAttribute("fill") != "red"){
      d3node[0][0].setAttribute("fill","blue");
      d3node[0][0].setAttribute("stroke","blue");
     }
  }

  document.getElementById("selectstart").setAttribute("disabled", "");
  document.getElementById("selectend").setAttribute("disabled", "");

  console.log(startNode);
  console.log(endNode);

  var d = new Dijkstra();
  console.log(d.getPath(startNode, endNode));
});

document.getElementById("enddrawing").addEventListener("click", function(){

  var n;
  for (var i = graph.nodes.length - 1; i >= 0; i--) {
    n = graph.nodes[i];

    console.log("creating node with id " + n.id)

    nodes.push(new Node(n.x, n.y, n.id));
  }

  var source, target, e;
  for (var i = graph.edges.length - 1; i >= 0; i--) {
    e = graph.edges[i];

    console.log("connecting " + e.source.id + " with " + e.target.id);

    source = getNode(e.source.id);
    target = getNode(e.target.id);
    source.addLink(new Link(target, e.weight));
    target.addLink(new Link(source, e.weight));
  };

  console.log(nodes);

  document.getElementById("enddrawing").setAttribute("disabled", "");
  document.getElementById("selectstart").removeAttribute("disabled");
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
