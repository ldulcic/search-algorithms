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