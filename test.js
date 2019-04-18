var width = Math.max(960, window.innerWidth),
    height = Math.max(500, window.innerHeight),
    prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);

	  d3.csv("coffee.csv", function(error, dataset) { createMap(dataset) });

var tile = d3.geo.tile()
    .size([width, height]);

var projection = d3.geo.mercator()
.scale((1 << 23) / 2 / Math.PI)
.translate([-width / 2, -height / 2]); // just temporary

var tileProjection = d3.geo.mercator();

var tilePath = d3.geo.path()
    .projection(tileProjection);

var zoom = d3.behavior.zoom()
    .scale(projection.scale() * 2 * Math.PI)
    .scaleExtent([1 << 9, 1 << 25])
    .translate(projection([-73.978277, 40.6791989]).map(function(x) { return -x; }))
    .on("zoom", zoomed);
		
var container = d3.select("body").append("div")
    .attr("id", "container")
    .style("width", width + "px")
    .style("height", height + "px")
    .call(zoom);

var map = container.append("g")
		.attr("id", "map")

var points = container.append("svg")
		.attr("id", "points")
				
var layer = map.append("div")
    .attr("class", "layer");

var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) { return "<img src='img/" + d.img + "' class='treeimg'>" + d.num + ". " + d.name + "<br/>(" + d.genus + " " + d.species + ")"; })

var tip = d3.tip()
  	.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) { return d.name; })

points.call(tip);

zoomed();

function createMap(dataset) {
	d3.select("#points").selectAll("circle").data(dataset) //plotted 	locations on map
	.enter()
	.append("circle")
	.attr("cx", function(d) {return projection([d.y,d.x])[0]})
	.attr("cy", function(d) {return projection([d.y,d.x])[1]})
	.attr("class", "coffee")
	.on('mouseover', tip.show)
	.on('mouseout', tip.hide)	
	zoomed();
}

function zoomed() {
  var tiles = tile
      .scale(zoom.scale())
      .translate(zoom.translate())
      ();

  projection
      .scale(zoom.scale() / 2 / Math.PI)
      .translate(zoom.translate());

var circles = d3.selectAll("circle")
							.attr("cx", function(d) {return projection([d.y,d.x])[0]})
							.attr("cy", function(d) {return projection([d.y,d.x])[1]})
    					.attr("r", .0000012*zoom.scale());
			
  var image = layer
      .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
    .selectAll(".tile")
      .data(tiles, function(d) { return d; });

  image.exit()
      .remove();

  image.enter().append("img")
      .attr("class", "tile")
			.attr("src", function(d) { return "http://" + ["a", "b", "c"][Math.random() * 3 | 0] + ".tile.openstreetmap.se/hydda/full/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
      .style("left", function(d) { return (d[0] << 8) + "px"; })
      .style("top", function(d) { return (d[1] << 8) + "px"; });
}

function matrix3d(scale, translate) {
  var k = scale / 256, r = scale % 1 ? Number : Math.round;
  return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
}

function prefixMatch(p) {
  var i = -1, n = p.length, s = document.body.style;
  while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
  return "";
}

function formatLocation(p, k) {
  var format = d3.format("." + Math.floor(Math.log(k) / 2 - 2) + "f");
  return (p[1] < 0 ? format(-p[1]) + "°S" : format(p[1]) + "°N") + " "
       + (p[0] < 0 ? format(-p[0]) + "°W" : format(p[0]) + "°E");
}