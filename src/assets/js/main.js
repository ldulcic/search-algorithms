var graph = d3.selectAll(".algorithm-right")
				.append("svg");


graph.attr("width", 500).attr("height", 500);

var nodes = [{x:30, y:50},
			 {x:50, y:80},
			 {x:90, y:120}]

graph.selectAll("circle.nodes")
		.data(nodes)
		.enter()
		.append("svg:circle")
		.attr("cx", function(d) {return d.x})
		.attr("cy", function(d) {return d.y})
		.attr("r", "10px")
		.attr("fill", "blue");