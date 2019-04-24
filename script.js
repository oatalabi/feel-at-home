const WIDTH = 1440;
const HEIGHT = 789;
const ZOOM_THRESHOLD = [0.2, 3];
const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
const ZOOM_DURATION = 500;
const ZOOM_IN_STEP = 2;
const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;
const HOVER_COLOR = "#d36f80";

function mouseOverHandler(d, i) {
    d3.select(this).attr("fill", "#576574")
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(`<b>${d.properties.name}</b>`)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
}

function mouseOutHandler(d, i) {
    if (d.properties.density !== undefined) {
        d3.select(this).attr("fill", colorMap(d.properties.density))
    } else {
        d3.select(this).attr("fill", "#3399cc")
    }
    tooltip.transition().duration(500).style("opacity", 0);
}
var allHousing = []

function clickHandler(d, i) {
    d.properties.clicked = !d.properties.clicked
    ageData = d.properties.age

    var pieData = ['0-14', '15-64', '65+'].map(function (d) {
        return {
            type: d,
            freq: d3.sum(ageData.map(function (t) {
                return t.freq[d];
            }))
        };
    });
    if (d.properties.clicked) {
        d3.selectAll("#map_space svg path").attr("stroke-width", "2px").attr("stroke-opacity", 1).style("opacity", 0.6)
        d3.selectAll("path#" + d.properties.id).attr("stroke-width", "15px").attr("stroke-opacity", 1).style("opacity", 1)
        d3.select("#information").style("display", "block").style('font', '12px sans-serif').style('border', '1px solid #ced4da').style('border-radius',
            '.2rem').style('background-color', '#fff').style('color', '#495057').style('font-size', '.875rem').style('padding',
                '.25rem .5rem').html(`<h5>${d.properties.name}</h5> <b>Number of listings</b>: ${d.properties.listings} <br> <b>Population</b>: ${d.properties.total_ages} <br> <b>Parks and Recreation Centers</b>: ${d.properties.parks}`)
        update(allHousing);
    } else {
        d3.selectAll("path#" + d.properties.id).attr("stroke-width", "2px").attr("stroke-opacity", 1).style("opacity", 0.6)
        d3.select("#information").style("display", "none");
        pieData = ['0-14', '15-64', '65+'].map(function (d) {
            return {
                type: d,
                freq: d3.sum(ageDist.map(function (t) {
                    return t.freq[d];
                }))
            };
        });
        pC.update(pieData)
    }
    d3.select("#rental-svg").remove()
    drawRentalGraph(rentalData, d.properties.name)
    pC.update(pieData)
    ageLegend(pieData, 'ethnic')
    leg.update(pieData)
    d3.select("#map__text").text(`You've selected ${d.properties.name}`)

}

defaultView = true

if (defaultView == true) {
    var datVan = vancouver;
}

var ethnicColor = d3.scaleThreshold().domain([0, 1000, 10000, 50000, 100000, 500000]).range(['#e3eaf2', '#c8d6e5', '#adc2d8', '#93aecc', '#789abf', '#5d87b3']);
var color_14 = d3.scaleThreshold().domain([0, 1000, 10000, 50000, 100000, 500000]).range(['#f0fdfa', '#cef8ed', '#abf3e0', '#89efd3', '#44e5ba', '#1dd1a1']);
var color_64 = d3.scaleThreshold().domain([0, 1000, 10000, 50000, 100000, 500000]).range(['#f1f7ff', '#cae1ff', '#a2ccff', '#7bb6ff', '#54a0ff', '#4095ff']);
var color_65 = d3.scaleThreshold().domain([0, 1000, 10000, 50000, 100000, 500000]).range(['#fef3f3', '#facfcf', '#f7abac', '#f38888', '#f06465', '#ea2e2f']);


d3.select("#ethnicity").on('change', function () {
    var newData = eval(d3.select(this).property('value'));
    if (newData == 0) {
        defaultView = true
        d3.select('#information').remove()
        d3.select(this).attr('active', false)
        renderMap(datVan, false, 'ethnic');
        d3.select(".legendethnic").remove();
    } else {
        d3.select(this).attr('active', true)
        defaultView = false
        colorMap = ethnicColor
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
        "transform", 'translate(110,25) scale(0.23)'
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
        "transform", 'translate(110,40) scale(0.23)'
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
        d3.select('#ethnic_map').remove();
    }
    if (type == 'age') {
        ageType = data.type
        datVan["features"].map(function (v) {
            v["properties"]["density"] = v["properties"]["age"][0]["freq"][ageType]
        })
        d3.select('#age_map').remove();
    }
    renderMap(datVan, true, type);
    var price = checkIfRental()
    if (price == 'true') {
        update(allHousing)
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
update('default')
// addSchools()

drawRentalGraph(rentalData, "All")
var rentalId = 0
rentalData.forEach(function (d) {
    d.rentalId = rentalId
    rentalId = rentalId + 1
})

var allSchools = [{
    name: "Saint Keth",
    latitude: 49.319322,
    longitude: -123.087595
},
{
    name: "British Hills Montessori",
    latitude: 49.324030,
    longitude: -123.081384
},
];


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
    .attr("max", max_rental)
    .attr("step", "100")
    .on("input", function input() {
        var selectedrent = parseInt(d3.select(this).property('value'))
        if (selectedrent != 0) {
            d3.select(this).attr('active', true)
        } else {
            d3.select(this).attr('active', false)
        }
        if (allHousing.length > 0) {
            update(allHousing);
        } else {
            update();
        }
    });


function appendSchools() {
    var schools = g.selectAll('.schools').data(allSchools)

}

function checkIfRental() {
    var price = d3.select('#price-slider input').attr('active')
    // var rentaltype = d3.select('#rental-type').attr('active')
    return price
}

function addSchools() {
    var schools = g.selectAll('.school')
    schools.enter().append("image");
    schools
        .attr("class", "school")
        .attr("xlink:href", "https://image.flaticon.com/icons/png/512/49/49944.png")
        .attr("x", projection(-123.087595))
        .attr("y", projection(49.319322))
        .attr("width", "50px")
        .attr('fill', 'red')
        .attr("height", "50px");
}

function renderMap(root, changed, type) {
    if (type == 'age') {
        d3.select('#age_map').remove();
        ageG.append("g")
            .attr('id', 'age_map')
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
                    return "#c8d6e5"
                }
            })
            .attr("stroke", "#FFF")
            .attr("stroke-width", 2)
            .on("mouseover", mouseOverHandler)
            .on("mouseout", function (d, i) {
                if (d.properties.density !== undefined && changed) {
                    d3.select(this).attr("fill", colorMap(d.properties.density))
                } else {
                    d3.select(this).attr("fill", "#c8d6e5")
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
    if (type == 'ethnic') {
        g
            .append("g")
            .attr('id', 'ethnic_map')
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
                    return "#c8d6e5"
                }
            })
            .attr("stroke", "#FFF")
            .attr("stroke-width", 2)
            .on("mouseover", mouseOverHandler)
            .on("mouseout", function (d, i) {
                if (d.properties.density !== undefined && changed) {
                    d3.select(this).attr("fill", ethnicColor(d.properties.density))
                } else {
                    d3.select(this).attr("fill", "#c8d6e5")
                }
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", clickHandler);
        update("default")
    }
}

function drawLegend(type, threshold) {

    var length = threshold.domain().length

    column("d3.scaleThreshold", threshold);

    function column(title, scale) {
        d3.select(".legend" + type).remove()
        var legend = d3.legendColor()
            .labelFormat(d3.format(",.0f"))
            .labels(d3.legendHelpers.thresholdLabels)
            .cells(length)
            .scale(scale);

        var div = d3.select("#map_space");
        if (type == 'ethnic') {
            var legendsvg = div.insert("div", "#map__container + *").attr("class", "col-2 legend" + type).html("<span>Population</span>")
                .style("padding", "0px").append("svg").attr("height", "100%").attr("width", "200px");
        }
        if (type == 'age') {
            var legendsvg = div.insert("div", "#age_map__container + *").attr("class", "col-2 legend" + type).html("<span>Population</span>")
                .style("padding", "0px").append("svg").attr("height", "100%").attr("width", "200px");
        }
        // div.append("span").text("Number of people");

        legendsvg.append("g")
            .attr("class", "legendQuant")
            .attr("transform", "translate(5,20)");

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
                    delete (i["viewType"])
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
                    .style("width", "auto")
                    .style("height", "auto")
                    .style("text-align", "left")
                    .style("overflow", "auto")
                    .style("opacity", .9);
                tooltip.html(`<div><b>${d.address}<br></b> <b>Housing Type</b>: ${d.type} <br> <b>Rent</b>: ${d.price} CAD<div>`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d, i) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .style("fill", function (d) {
                return "rgba(254, 202, 87, 0.5)"
            });
        exit.remove();
    } else {
        var slider_price = document.getElementById("price").value;
        d3.select('#price_view').text(slider_price)
        var count = 0

        var alldata = {
            "3-Bedroom+": 25,
            "2-Bedroom": 31,
            "1-Bedroom": 17,
            "Bachelor": 13
        }
        if (rental_type != 'none') {
            var new_loc = []
            var new_loc = all_loc
            rentalData.forEach(function (d) {
                if (d["name"] != "All") {
                    d["areas"].filter(function (i) {
                        if ((rental_type.indexOf(i['type']) > -1) && parseInt(slider_price) === 100) {
                            if (new_loc.indexOf(i) > -1) {
                                i["viewType"] = "housing"
                            }
                            return true
                        }
                        if ((rental_type.indexOf(i['type']) > -1) && (i['price'] <= parseInt(slider_price))) {
                            if (new_loc.indexOf(i) > -1) {
                                i["viewType"] = "housing"
                            }
                            return true
                        }
                        if ((rental_type.indexOf(i['type']) > -1) && (i['price'] > parseInt(slider_price))) {
                            count += 1
                        }
                    })
                }
                if (count == alldata[rental_type]) {
                    alert('No matching available rent was found for ' + parseInt(slider_price) + 'CAD in one of the selected housing types, please select a different price or housing type')
                }
            })
        } else {
            var new_loc = []
            var new_loc = all_loc

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
                    .style("width", "auto")
                    .style("height", "auto")
                    .style("text-align", "left")
                    .style("overflow", "auto")
                    .style("opacity", .9);
                tooltip.html(`<div><b>${d.address}<br></b> <b>Housing Type</b>: ${d.type} <br> <b>Rent</b>: ${d.price} CAD<div>`)
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
                    return housingColor(d.type);
                } else {
                    return "rgba(254, 202, 87, 0.5)"
                }
            });

        exit.remove();
    }

};

function housingColor(c) {
    return {
        '3-Bedroom+': 'rgba(34, 47, 62,1.0)',
        '1-Bedroom': "#ff9ff3",
        '2-Bedroom': 'rgba(95, 39, 205, 0.7)',
        'Bachelor': 'rgba(0, 210, 211,1.0)'
        // 'Bachelor': '#b71540' 
    }[c];
}

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
        .attr("kind", function (d) {
            return d.name;
        })
        .attr('active', 'false')
        .attr('id', "rental-type")
        .style("fill", function (d) {
            return housingColor(d.name);
        })
        // .style('stroke', )
        .style("stroke-width", "1px").style("stroke-opacity", 1)
        .on("click", clicked)
        .on("mouseover", function (d, i) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`<b>${d.available}</b> houses available for rent`)
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
        var checkStatus = d3.select(this).attr('active')
        if (checkStatus == 'true') {
            d3.select(this).attr('active', 'false')
            allHousing = allHousing.filter(function (n) {
                return (n != d.name)
            })
            d3.select(this).attr('rental_selected', null)
            d3.select(this).style("stroke-width", "1px").style("stroke-opacity", 1).style("opacity",
                "1").style('height', "25px")
            update(allHousing)
        } else {
            d3.select(this).attr('rental_selected', 'true')
            d3.select(this).attr('active', 'true')
            d3.selectAll('#rental-type').style("stroke-width", "1px").style("stroke-opacity", 1)
            d3.selectAll('[rental_selected=true]').style('stroke', 'grey').style("stroke-width", "2px").style("stroke-opacity", 1).style('height', "27px").style("opacity", "0.5")
            allHousing.push(d.name)
            update(allHousing)
        }
        d3.selectAll('#rental-type').style('fill', function (d) {
            return housingColor(d.name);
        })
    }
}

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
        '0-14': "rgba(29, 209, 161, 1.0)",
        '15-64': "rgba(84, 160, 255, 1.0)",
        '65+': "rgba(255, 107, 107, 1.0)"
    }[c];
}

function drawAgeGraph(data) {
    var pC = {},
        pieDim = {
            w: 200,
            h: 200
        };
    pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

    // create svg for pie chart.
    var piesvg = d3.select('#age div.chart').append("svg")
        .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
        .attr("transform", "translate(" + pieDim.w / 2 + "," + pieDim.h / 2 + ")");

    // create function to draw the arcs of the pie slices.
    var arc = d3.arc().outerRadius(pieDim.r - 20).innerRadius(0);

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
        if (d.data.type == '0-14') {
            focused_14 = !focused_14
            d3.select(this).attr('id', 'age_forteen')
            focused_65 = false
            focused_64 = false
            colorMap = color_14
        }
        if (d.data.type == '15-64') {
            focused_64 = !focused_64
            d3.select(this).attr('id', 'age_sixtyfour')
            focused_65 = false
            focused_14 = false
            colorMap = color_64
        }
        if (d.data.type == '65+') {
            focused_65 = !focused_65
            d3.select(this).attr('id', 'age_sixtyfive')
            focused_14 = false
            focused_64 = false
            colorMap = color_65
        }
        if (focused_65 && d.data.type == '65+') {
            d3.select(this).style('stroke', 'grey').style("stroke-width", "4px").style("stroke-opacity", 1).style('opacity', 1)
        }
        if (focused_64 && d.data.type == '15-64') {
            d3.select(this).style('stroke', 'grey').style("stroke-width", "4px").style("stroke-opacity", 1).style('opacity', 1)
        }
        if (focused_14 && d.data.type == '0-14') {
            d3.select(this).style('stroke', 'grey').style("stroke-width", "4px").style("stroke-opacity", 1).style('opacity', 1)
        }
        if (!focused_65) {
            d3.select('#age_sixtyfive').style('fill', 'rgba(255, 107, 107, 1.0)').style("stroke-opacity", 0)
        }
        if (!focused_64) {
            d3.select('#age_sixtyfour').style('fill', 'rgba(84, 160, 255, 1.0)').style("stroke-opacity", 0)
        }
        if (!focused_14) {
            d3.select('#age_forteen').style('fill', 'rgba(29, 209, 161, 1.0)').style("stroke-opacity", 0)
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
    var legendage = d3.select('#age div.table1').append("table").attr('class', 'legend');

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