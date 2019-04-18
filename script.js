const WIDTH = "1440px";
const HEIGHT = "789px";
const ZOOM_THRESHOLD = [0.2, 3];
const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
const ZOOM_DURATION = 500;
const ZOOM_IN_STEP = 2;
const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;
const HOVER_COLOR = "#d36f80";

// --------------- Event handler ---------------
const zoom = d3.zoom()
    .scaleExtent(ZOOM_THRESHOLD)
    .on("zoom", function () {
        g.attr("transform", d3.event.transform);
    });

function mouseOverHandler(d, i) {
    d3.select(this).attr("fill", "#2F4F4F").attr("stroke-width", "1px").attr("stroke-opacity", 1).style("opacity", 0.6)
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(d.properties.name)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
}

function mouseOutHandler(d, i) {
    if (d.properties.density !== undefined) {
        d3.select(this).attr("fill", colorMap(d.properties.density))
    } else {
        d3.select(this).attr("fill", "#3399cc")
    }
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

function clickHandler(d, i) {
    d.properties.clicked = !d.properties.clicked
    if (d.properties.clicked) {
        d3.selectAll("#map_space svg path").attr("stroke-width", "1px").attr("stroke-opacity", 1).style("opacity", 0.6)
        // d3.select(this).attr("stroke-width", "10px").attr("stroke-opacity", 1).style("opacity", 1)
        d3.selectAll("path#" + d.properties.id).attr("stroke-width", "10px").attr("stroke-opacity", 1).style("opacity", 1)
        update();
    } else {
        d3.select(this).attr("fill", "#A9A9A9").attr("stroke-width", "1px").attr("stroke-opacity", 1).style("opacity", 0.6)
    }
    ageData = d.properties.age
    var pieData = ['0-14', '15-64', '65+'].map(function (d) {
        return {
            type: d,
            freq: d3.sum(ageData.map(function (t) {
                return t.freq[d];
            }))
        };
    });
    d3.select("#rental-svg").remove()
    drawRentalGraph(rentalData, d.properties.name)
    pC.update(pieData)
    ageLegend(pieData, 'ethnic')
    leg.update(pieData)
    d3.select("#map__text").text(`You've selected ${d.properties.name}`)
    d3.select("#information").style('font', '12px sans-serif').style('border', '1px solid #ced4da').style('border-radius', '.2rem')
        .style('background-color', '#fff').style('color', '#495057').style('font-size', '.875rem').style('padding', '.25rem .5rem').html(`Additional Information<br><br> <b>Number of listings</b>: ${d.properties.listings} <br> <b>Population</b>: ${d.properties.total_ages} <br> <b>Parks and Recreation Centers</b>: ${d.properties.parks}`)
}

defaultView = true
// var color = d3.scaleOrdinal(d3.schemeCategory20c.slice(1, 4));

if (defaultView == true) {
    var datVan = vancouver;
}

var ethnicColor = d3.scaleThreshold().domain([0, 1000, 10000, 50000, 100000, 500000]).range(['#F8F8F8', '#E8E8E8', '#DCDCDC', '#D0D0D0', '#B0B0B0', '#888888']);
var color_14 = d3.scaleThreshold().domain([0, 1000, 10000, 50000, 100000, 500000]).range(['#fef3f3', '#facfcf', '#f7abac', '#f38888', '#f06465', '#ea2e2f']);
// var color_64 = d3.scaleThreshold().domain([0, 500, 1000, 10000, 50000, 100000, 500000]).range(['#ffe3c4', '#ffcd93', '#efc28d', '#efae62', '#f9a748', '#ef9d3e', '#e08214']);
// var color_65 = d3.scaleThreshold().domain([0, 500, 1000, 10000, 50000, 100000, 500000]).range(['#b2ffc6', '#9cedb1', '#8be0a1', '#81db98', '#79d18f', '#57c173', '#41ab5d']);

d3.select("#ethnicity").on('change', function () {
    var newData = eval(d3.select(this).property('value'));

    if (newData == 0) {
        defaultView = true
        d3.select('#information').remove()
        d3.select(this).attr('active', false)
        // color = d3.scaleOrdinal(d3.schemeCategory20c.slice(1, 4));
        renderMap(datVan, false, 'ethnic');
        // d3.select(".legend").remove();
    } else {
        d3.select(this).attr('active', true)
        defaultView = false
        colorMap = ethnicColor
        // d3.scaleThreshold().domain([0, 500, 1000, 10000, 50000, 100000, 500000]).range(['#C6DBEF', '#9ECAE1', '#6baed6', '#3399cc', '#005ea8', '#3b508b', '#081d58']);
        addDensity(newData, 'ethnic')
        drawLegend('ethnic', colorMap)
        leg = ageLegend(pieData, 'ethnic')
    }
});

// Prepare SVG container for placing the map,
// and overlay a transparent rectangle for pan and zoom.    
var svg = d3
    .select("#map__container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

var ageSvg = d3
    .select("#age_map__container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

// var g = svg.append("g")
var g = svg.append("g")
var ageG = ageSvg.append("g")

g
    .append("rect")
    .attr("width", WIDTH * OVERLAY_MULTIPLIER)
    .attr("height", HEIGHT * OVERLAY_MULTIPLIER)
    .attr(
        "transform",
        `translate(-${WIDTH * OVERLAY_OFFSET},-${HEIGHT * OVERLAY_OFFSET})`
    )
    .style("fill", "none")
    .style("pointer-events", "all");

g
    .attr(
        "transform", 'translate(130,40) scale(0.23)'
    )

ageG
    .append("rect")
    .attr("width", WIDTH * OVERLAY_MULTIPLIER)
    .attr("height", HEIGHT * OVERLAY_MULTIPLIER)
    .attr(
        "transform",
        `translate(-${WIDTH * OVERLAY_OFFSET},-${HEIGHT * OVERLAY_OFFSET})`
    )
    .style("fill", "none")
    .style("pointer-events", "all");

ageG
    .attr(
        "transform", 'translate(130,40) scale(0.23)'
    )

svg_width = d3.select("#map__container").node().getBoundingClientRect().width;
svg_height = d3.select("#map__container").node().getBoundingClientRect().height;
ageSvg_width = d3.select("#age_map__container").node().getBoundingClientRect().width;
ageSvg_height = d3.select("#age_map__container").node().getBoundingClientRect().height;

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
var rental_type = ''

var datVan = vancouver

function addDensity(data, type) {
    vals = {
        1: "american",
        2: "european",
        3: "carribean",
        4: "latin",
        5: "african",
        6: "asian",
        7: "oceania"
    }

    if (type == 'ethnic') {
        datVan["features"].map(function (v) {
            v["properties"]["density"] = Math.floor(parseInt(v["properties"][vals[data]]))
        })
    }
    if (type == 'age') {
        ageType = data.type
        datVan["features"].map(function (v) {
            v["properties"]["density"] = v["properties"]["age"][0]["freq"][ageType]
        })
    }
    d3.select(g).remove();
    renderMap(datVan, true, type);
    var price = checkIfRental()
    if (price == 'true') {
        update(rental_type)
    }
}

const projection = d3
    .geoMercator()
    .center([-122.42416887399992, 49.25008676900006])
    .scale(80000)
    .translate([WIDTH / 2, HEIGHT / 2]);

const path = d3.geoPath().projection(projection);

renderMap(datVan, false, 'ethnic');
renderMap(datVan, false, 'age');

drawRentalGraph(rentalData, "All")
var rentalId = 0
rentalData.forEach(function (d) {
    d.rentalId = rentalId
    rentalId = rentalId + 1
})

var min_rental = d3.min(rentalData, function (d) {
        return d["Bachelor"];
    }),
    max_rental = d3.max(rentalData, function (d) {
        return d["3-Bedroom+"];
    });

var price_svg = d3.select("#price-slider")
price_svg.append("input")
    .attr("type", "range")
    .attr("id", "price")
    .attr("min", 0)
    .attr("max", 5000)
    .attr("step", "100")
    .on("input", function input() {
        var selectedrent = parseInt(d3.select(this).property('value'))
        if (selectedrent != 0) {
            d3.select(this).attr('active', true)
        } else {
            d3.select(this).attr('active', false)
        }
        update();
    });

function checkIfRental() {
    var price = d3.select('#price-slider input').attr('active')
    // var rentaltype = d3.select('#rental-type').attr('active')
    return price
}

function renderMap(root, changed, type) {
    if(type == 'age'){
        ageG.append("g")
            .selectAll("path")
            .data(root.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("id", function (d) {
                return d.properties.id;
            })
            .style("opacity", 0.6)
            .attr("fill", function (d, i) {
                if (changed) {
                    return colorMap(d.properties.density)
                } else {
                    return "#A9A9A9"
                }
            })
            .attr("stroke", "#FFF")
            .attr("stroke-width", 0.5)
            .on("mouseover", mouseOverHandler)
            .on("mouseout", function(d,i){
                if (d.properties.density !== undefined && changed) {
                    d3.select(this).attr("fill", color_14(d.properties.density))
                } else {
                    d3.select(this).attr("fill", "#A9A9A9")
                }
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", clickHandler)
            // .attr("id", function (d) {
            //     return d.properties.id;
            // })
            // .style("opacity", 0.6)
    }
    if (type == 'ethnic'){
        update("default")
        g
            .append("g")
            .selectAll("path")
            .data(root.features)
            .enter()
            .append("path")
            .attr("id", function (d) {
                return d.properties.id;
            })
            .style("opacity", 0.6)
            .attr("d", path)
            .attr("fill", function (d, i) {
                if (changed) {
                    return colorMap(d.properties.density)
                } else {
                    return "#A9A9A9"
                }
            })
            .attr("stroke", "#FFF")
            .attr("stroke-width", 0.5)
            .on("mouseover", mouseOverHandler)
            .on("mouseout", function(d, i){
                if (d.properties.density !== undefined && changed) {
                    d3.select(this).attr("fill", ethnicColor(d.properties.density))
                } else {
                    d3.select(this).attr("fill", "#A9A9A9")
                }
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", clickHandler);
    }
}

function drawLegend(type, threshold) {
    
    var length = threshold.domain().length
    
    column("d3.scaleThreshold", threshold);
    
    function column(title, scale) {
        d3.select(".legend"+type).remove()
        var legend = d3.legendColor()
            .labelFormat(d3.format(",.0f"))
            .labels(d3.legendHelpers.thresholdLabels)
            .cells(length)
            .scale(scale);

        var div = d3.select("#map_space");
        if(type == 'ethnic'){
            var legendsvg = div.insert("div", "#map__container + *").attr("class", "col-2 legend" + type).html("<span>Population</span>")
                .style("padding", "0px").append("svg").attr("height", "100%").attr("width", "200px");
        }
        if(type == 'age'){
            var legendsvg = div.insert("div", "#age_map__container + *").attr("class", "col-2 legend" + type).html("<span>Population</span>")
                .style("padding", "0px").append("svg").attr("height", "100%").attr("width", "200px");
        }
        // div.append("span").text("Number of people");

        legendsvg.append("g")
            .attr("class", "legendQuant")
            .attr("transform", "translate(20,20)");

        legendsvg.select(".legendQuant")
            .call(legend);
    }
}

var rent = g.append("g").attr("class", 'map__container' + "_rental");

function rental_color(rentalData) {
    return "red"
}
function update(rental_type = 'none') {
    const rental_types = {
        1: "Bachelor",
        2: "1-Bedroom",
        3: "2-Bedroom",
        4: "3-Bedroom+"
    }

    var all_loc = []

    rentalData.forEach(function (d) {
        if (d["name"] != "All") {
            d["areas"].forEach(function (i) {
                all_loc.push(i)
                if (i["viewType"]) {
                    delete(i["viewType"])
                }
            })
        }
    })
    if (rental_type == 'default') {
        // Render and style circle location marker for each observation in reviews dataset
        var circles = g.selectAll("circle")
        var join = circles.data(all_loc, function (d) {
            return d.id
        })

        var enter = join.enter()
        var exit = join.exit()

        enter.append("circle")
            .attr("class", 'map__container' + "_rental_markers" + "default")
            .attr("cx", function (d) {
                return projection([d["Longitude"], d["Latitude"]])[0];
            })
            .attr("cy", function (d) {
                return projection([d["Longitude"], d["Latitude"]])[1];
            })
            .attr("r", 15)
            .on("mouseover", function (d, i) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.type + ': ' + d.price)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d, i) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .style("fill", function (d) {
                return "#ff9b9b"
            });
        exit.remove();
    } else {
        var slider_price = document.getElementById("price").value;
        d3.select('#price_view').text(slider_price)
        if (rental_type != 'none') {
            var new_loc = []
            var new_loc = all_loc
            rentalData.forEach(function (d) {
                if (d["name"] != "All") {
                    d["areas"].filter(function (i) {
                        if (i['type'] == rental_type && parseInt(slider_price) === 100) {
                            if (new_loc.indexOf(i) > -1) {
                                i["viewType"] = "housing"
                            }
                            return true
                        }
                        if (i['type'] == rental_type && (i['price'] <= parseInt(slider_price))) {
                            if (new_loc.indexOf(i) > -1) {
                                i["viewType"] = "housing"
                            }
                            return true
                        }
                    })
                }
            })
        } else {
            var new_loc = []
            var new_loc = all_loc
            console.log("only price slider no rental_type")

            rentalData.forEach(function (d) {
                if (d["name"] != "All") {
                    d["areas"].forEach(function (i) {
                        if (parseInt(i["price"]) <= parseInt(slider_price)) {
                            i["viewType"] = "housing"
                        }
                    })
                }
            })
        }

        // Render and style circle location marker for each observation in reviews dataset
        var circles = g.selectAll("circle")
        var join = circles.data(new_loc, function (d) {
            return d.id
        })

        var enter = join.enter()
        var exit = join.exit()

        enter.append("circle")
            .attr("class", 'map__container' + "_rental_markers")
            .attr("cx", function (d) {
                return projection([d["Longitude"], d["Latitude"]])[0];
            })
            .attr("cy", function (d) {
                return projection([d["Longitude"], d["Latitude"]])[1];
            })
            .attr("r", 15)
            .on("mouseover", function (d, i) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.type + ': ' + d.price)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d, i) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .style("fill", function (d) {
                if (d.viewType == 'housing') {
                    return "rgb(52, 31, 151, 0.9)"
                } else {
                    return "#ff9b9b"
                }
            });

        exit.remove();
    }

};
// function update(type='none') {
//     const rental_types = {
//         1: "Bachelor",
//         2: "1-Bedroom",
//         3: "2-Bedroom",
//         4: "3-Bedroom+"
//     }

//     var slider_price = document.getElementById("price").value;
//     d3.select('#price_view').text(slider_price)
//     var new_loc = []
    
//     if (type != 'None') {
//         rental_type = type
//         rentalData.forEach(function (d) {
//             if (d["name"] != "All"){
//                 d["areas"].filter(function (i) {
//                     if (i['type'] == type && parseInt(slider_price) === 100) {
//                         new_loc.push(i)
//                         return true
//                     }
//                     if (i['type'] == type && (i['price'] <= parseInt(slider_price))) {
//                         new_loc.push(i)
//                         return true
//                     }
//                 })
//             }
//         })
//     } else {
//         rental_type = rental_types[document.getElementById("rental-type").value]
//         new_loc = rentalData.filter(function filter_by_price(d) {
//             if (parseInt(d[rental_type]) <= parseInt(slider_price)) {
//                 return true;
//             }
//         });
//     }

//     // Render and style circle location marker for each observation in reviews dataset
//     var circles = g.selectAll("circle")
//     var join = circles.data(new_loc, function (d) {
//         return d.id
//     })

//     var enter = join.enter()
//     var exit = join.exit()

//     enter.append("circle")
//         .attr("class", 'map__container' + "_rental_markers")
//         .attr("cx", function (d) {
//             return projection([d["Longitude"], d["Latitude"]])[0];
//         })
//         .attr("cy", function (d) {
//             return projection([d["Longitude"], d["Latitude"]])[1];
//         })
//         .attr("r", 15)
//         .style("fill", function (d) {
//             return rental_color(d)
//         });

//     exit.remove();
// };

function drawRentalGraph(data, value) {
    var rentalDetails = []
    data.forEach(function (d) {
        if (d.name == value) {
            rentalDetails.push({
                name: "Bachelor",
                value: d["Bachelor"],
                "available": d["availableBachelor"]
            })
            rentalDetails.push({
                name: "1-Bedroom",
                value: d["1-Bedroom"],
                "available": d["available1Bed"]
            })
            rentalDetails.push({
                name: "2-Bedroom",
                value: d["2-Bedroom"],
                "available": d["available2Bed"]
            })
            rentalDetails.push({
                name: "3-Bedroom+",
                value: d["3-Bedroom+"],
                "available": d["available3Bed"]
            })
        }
    });
    var margin = {
        top: 15,
        right: 25,
        bottom: 15,
        left: 60
    };

    var width = 1060 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var rentalsvg = d3.select("#rental").append("svg")
        .attr("id", "rental-svg")
        .attr("width", "100%")
        .attr("height", "200")
        .append("g")
        .attr("transform", "translate(100, 10)");

    var x = d3.scaleLinear()
        .range([0, width / 3])
        .domain([0, d3.max(rentalDetails, function (d) {
            return d.value;
        })]);

    var y = d3.scaleBand()
        .rangeRound([height / 4, 0])
        .padding(0.1)
        .domain(rentalDetails.map(function (d) {
            return d.name;
        }));

    //make y axis to show bar names
    var yAxis = d3.axisLeft(y)
        .tickSizeInner(5)
        .tickSizeOuter(10);

    var gy = rentalsvg.append("g")
        .attr("class", "y axis")
        .call(yAxis)

    var bars = rentalsvg.selectAll(".bar")
        .data(rentalDetails)
        .enter()
        .append("g")

    //append rects
    bars.append("rect")
        .attr("class", "bar")
        .attr("y", function (d) {
            return y(d.name);
        })
        .style("fill", "rgb(52, 31, 151, 0.9)")
        .on("click", clicked)
        .on("mouseover", function (d, i) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.available + ' available for rent')
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function (d, i) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", function (d) {
            return x(d.value);
        });

    //add a value label to the right of each bar
    bars.append("text")
        .attr("class", "label")
        //y position of the label is halfway down the bar
        .attr("y", function (d) {
            return y(d.name) + y.bandwidth() / 2 + 4;
        })
        //x position is 3 pixels to the right of the bar
        .attr("x", function (d) {
            return x(d.value) + 3;
        })
        .text(function (d) {
            return d.value;
        });

    //add a title to bar-chart
    bars.append("text")
        .attr("x", (width / 24))
        .attr("y", 0 - (margin.top / 0.8))
        .style("font-size", "1.25rem")
        .style("font-weight", "500")
        .style("font-family", "sans-serif");

    function clicked(d) {
        d3.select(this).attr('id', "rental-type")
        d3.select(this).attr('active', 'true')
        update(d.name)
    }
}

// calculate total frequency by segment for all state.
var pieData = ['0-14', '15-64', '65+'].map(function (d) {
    return {
        type: d,
        freq: d3.sum(ageDist.map(function (t) {
            return t.freq[d];
        }))
    };
});
var pC = drawAgeGraph(pieData)

function segColor(c) {
    return {
        '0-14': "rgba(128, 125, 186, 0.2)",
        '15-64': "rgba(128, 125, 186, 0.6)",
        '65+': "rgba(128, 125, 186, 1)"
    } [c];
}

function drawAgeGraph(data) {
    var pC = {},
        pieDim = {
            w: 250,
            h: 250
        };
    pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

    // create svg for pie chart.
    var piesvg = d3.select('#age').append("svg")
        .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
        .attr("transform", "translate(" + pieDim.w / 2 + "," + pieDim.h / 2 + ")");

    // create function to draw the arcs of the pie slices.
    var arc = d3.arc().outerRadius(pieDim.r - 10).innerRadius(0);

    // create a function to compute the pie slice angles.
    var pie = d3.pie().sort(null).value(function (d) {
        return d.freq;
    });

    // Draw the pie slices.
    piesvg.selectAll("path").data(pie(data)).enter().append("path").attr("d", arc)
        .each(function (d) {
            this._current = d;
        })
        .style("fill", function (d) {
            return segColor(d.data.type);
        })
        .on("click", mouseover);
        // .on("mouseout", mouseout);

    // create function to update pie-chart. This will be used by histogram.
    pC.update = function (nD) {
        piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
            .attrTween("d", arcTween);
    }
    var focused_14 = false
    var focused_64 = false
    var focused_65 = false

    function mouseover(d) {
        console.log('-im cliecked===')
        if (d.data.type == '0-14') {
            focused_14 = !focused_14
            console.log(focused_14, '====')
            if(focused_14 == true){
                console.log('=======')
                d3.select(this).attr('stroke', '#fff !important').attr("stroke-width", "5px").attr("stroke-opacity", 1).style("opacity", 0.6).attr('fill', 'purple')
            }
            focused_65 = false
            focused_64 = false
            colorMap = color_14
            //  = d3.scaleThreshold().domain([0, 500, 1000, 10000, 50000, 100000, 500000]).range(['#f0eff9', '#d7d5ef', '#ccc9ea', '#b9b5e0', '#908dc6', '#918fc4', '#807dba']);
        }
        if (d.data.type == '15-64') {
            focused_64 = !focused_64
            focused_65 = false
            focused_14 = false
            colorMap = color_14
            // ethnicColor = d3.scaleThreshold().domain([0, 500, 1000, 10000, 50000, 100000, 500000]).range(['#ffe3c4', '#ffcd93', '#f9a748', '#efc28d', '#efae62', '#ef9d3e', '#e08214']);
        }
        if (d.data.type == '65+') {
            focused_65 = !focused_65
            focused_14 = false
            focused_64 = false
            colorMap = color_14
            // ethnicColor = d3.scaleThreshold().domain([0, 500, 1000, 10000, 50000, 100000, 500000]).range(['#b2ffc6', '#9cedb1', '#8be0a1', '#81db98', '#79d18f', '#57c173', '#41ab5d']);
        }
        defaultView = false
        addDensity(d.data, 'age')
        leg.update(pieData)
        drawLegend('age', colorMap)
        if (!focused_14 && !focused_64 && !focused_65) {
            var selected = d3.select('#ethnicity').attr('active')
            if (selected == 'true') {
                defaultView = false
                newData = eval(d3.select('#ethnicity').property('value'));
                colorMap = ethnicColor
                // ethnicColor = d3.scaleThreshold().domain([0, 500, 1000, 10000, 50000, 100000, 500000]).range(['#C6DBEF', '#9ECAE1', '#6baed6', '#3399cc', '#005ea8', '#3b508b', '#081d58']);
                addDensity(newData, 'ethnic')
                drawLegend('ethnic', colorMap)
                renderMap(datVan, false, 'age');
                d3.select(".legendage").remove()
            } else {
                defaultView = true
                // color = d3.scaleOrdinal(d3.schemeCategory20c.slice(1, 4));
                renderMap(datVan, false, 'age');
                d3.select(".legendage").remove()
            }
        }
    }

    // function mouseout(d) {
    // }
    // Animating the pie-slice requiring a custom function which specifies
    // how the intermediate paths should be drawn.
    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function (t) {
            return arc(i(t));
        };
    }
    return pC;
}

leg = ageLegend(pieData, 'show')

function ageLegend(lD, show) {
    if (show == 'ethnic') {
        d3.select('#age table').remove()
    }
    var leg = {};

    // create table for legend.
    var legendage = d3.select('#age').append("table").attr('class', 'legend');

    // create one row per segment.
    var tr = legendage.append("tbody").selectAll("tr").data(lD).enter().append("tr");

    // create the first column for each segment.
    tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
        .attr("width", '16').attr("height", '16')
        .attr("fill", function (d) {
            return segColor(d.type);
        });

    // create the second column for each segment.
    tr.append("td").text(function (d) {
        return d.type;
    });

    // create the third column for each segment.
    tr.append("td").attr("class", 'legendFreq')
        .text(function (d) {
            return d3.format(",")(d.freq);
        });

    // create the fourth column for each segment.
    tr.append("td").attr("class", 'legendPerc')
        .text(function (d) {
            return getLegend(d, lD);
        });

    // Utility function to be used to update the legend.
    leg.update = function (nD) {
        // update the data attached to the row elements.
        var l = legendage.select("tbody").selectAll("tr").data(nD);

        // update the frequencies.
        l.select(".legendFreq").text(function (d) {
            return d3.format(",")(d.freq);
        });

        // update the percentage column.
        l.select(".legendPerc").text(function (d) {
            return getLegend(d, nD);
        });
    }

    function getLegend(d, aD) { // Utility function to compute percentage.
        value = d.freq / (d3.sum(aD.map(function (v) {
            return v.freq;
        }))) * 100
        return (value.toFixed(2)) + '%'

    }

    return leg;
}