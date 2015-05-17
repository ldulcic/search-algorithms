// -------------------------------------------
//                 OBJECTS
// -------------------------------------------
// ---------------- VEZA ----------------
// -------------------------------------------
function Veza(first, second){
    this.begin = first;
    this.end = second;
}

Veza.prototype = {
    constructor: Veza
};

var veze = null;
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