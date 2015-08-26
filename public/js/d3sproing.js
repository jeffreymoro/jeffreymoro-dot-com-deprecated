//Width and height
var width = 600;
var height = 400;
var margin = {top: 20, right: 20, bottom: 20, left: 20};

//Get the dataset
var dataset = document.getElementById('dataset').innerHTML;
graph = JSON.parse(dataset);

//Initialize force layout
var force = d3.layout.force()
		 .size([width, height])
		 .linkDistance([50])
		 .charge([-50]);

//Create SVG element
var svg = d3.select("#canvas")
    //.append("svg")
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
    //.append("g")
    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    .append("div")
   .classed("svg-container", true) //container class to make it responsive
   .append("svg")
   //responsive SVG needs these 2 attributes and no width and height attr
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 600 400")
   //class to make it responsive
   .classed("svg-content-responsive", true); 

//Create graph structure
force.nodes(graph.nodes)
.links(graph.links)
.start();

// Assign colors to groups
var colors = function(dataset){
	if (dataset.group === "none") {
		return "#949494";
	} else if (dataset.group === "red") {
		return "#ff0000";
	} else if (dataset.group === "blue") {
		return "#00A6FF";
	} else if (dataset.group === "orange") {
		return "#FFA200";
	} else if (dataset.group === "purple") {
		return "#BB00FF";
	} else if (dataset.group === "green") {
		return "#00B539";
	} else {
		return "#000000";
	}
}; 

//Create links as lines
var link = svg.selectAll(".link")
	.data(graph.links)
	.enter()
	.append("line")
	.attr("class", "link")
	.style("stroke", "#ccc")
	.style("stroke-width", 1);

//Create nodes as circles
var node = svg.selectAll(".node")
	.data(graph.nodes)
	.enter()
	.append("circle")
	.attr("class", "node")
	.attr("r", 8)
	.style("fill", colors)
	.call(force.drag)
	// Update label box
	.on("click", function(d) {
		d3.select("#labelbox")
		.select("#name")
		.text(d.name);
		d3.select("#labelbox")	
		.select("#username")
    	.html('<a href="http://www.twitter.com/' + d.username + '" target="_blank">' + d.username + '</a>');
		d3.select("#labelbox")
		.select("#tweet")
		.text(d.tweet);
		d3.select("#labelbox")
		.select("#group")
		.text(d.group);
	})
	// Initialize highlighting
	.on('dblclick', connectedNodes);

//Every time the simulation "ticks", this will be called
force.on("tick", function() {

	link.attr("x1", function(d) { return d.source.x; })
		 .attr("y1", function(d) { return d.source.y; })
		 .attr("x2", function(d) { return d.target.x; })
		 .attr("y2", function(d) { return d.target.y; });

	node.attr("cx", function(d) { return d.x; })
		 .attr("cy", function(d) { return d.y; });	
});

//---Insert-------

//Toggle stores whether the highlighting is on
var toggle = 0;

//Create an array logging what is connected to what
var linkedByIndex = {};
for (i = 0; i < graph.nodes.length; i++) {
    linkedByIndex[i + "," + i] = 1;
};
graph.links.forEach(function (d) {
    linkedByIndex[d.source.index + "," + d.target.index] = 1;
});

//This function looks up whether a pair are neighbours  
function neighboring(a, b) {
    return linkedByIndex[a.index + "," + b.index];
}

function connectedNodes() {

    if (toggle == 0) {
        //Reduce the opacity of all but the neighbouring nodes
        d = d3.select(this).node().__data__;
        node.style("opacity", function (o) {
            return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
        });
        
        link.style("opacity", function (o) {
            return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
        });
        
        //Reduce the op
        
        toggle = 1;
    } else {
        //Put them back to opacity=1
        node.style("opacity", 1);
        link.style("opacity", 1);
        toggle = 0;
    }

}

//---End Insert---