function donutChart() {
		/* variables accessible with getters/setters */
    var radius,
		level = 0, //indicates the level (higher means smaller circle)
        colour = d3.scaleOrdinal(d3.schemeDark2), // colour scheme
        column, // compare data by
		/* private variables */
		arc, 
		data,
		descriptionString,
		valueString,
		hoverArc,
		hoverBlocked = false;

    function chart(selection){
        selection.each(function(rawData) {
			
			// nest data
			data = d3.nest()
				.key(function(d) {
						if(columnInfo[column] && columnInfo[column].mappingFunction)
							return columnInfo[column].mappingFunction(d[column]);
						else
							return d[column];
					})
				.rollup(v => v.length) 
				.entries(rawData);
			
			// description and value string mapper
			if(columnInfo[column] && columnInfo[column].descriptionString)
				descriptionString = columnInfo[column].descriptionString;
			else 
				descriptionString = function (d) {return ""}; // default description is empty
			
			if(columnInfo[column] && columnInfo[column].valueString)
				valueString = columnInfo[column].valueString;
			else 
				valueString = function (d) {return d ? d : "nicht angegeben";} // default value string is the value itself
			
            // generate chart
      
            // creates a new pie generator
            var pie = d3.pie()
				.value(function(d) { return d.value; })
				.startAngle(0)
				.endAngle( 2* Math.PI)
				.padAngle(.005);
			
            // contructs and arc generator. This will be used for the donut. The difference between outer and inner
            // radius will dictate the thickness of the donut
            arc = d3.arc()
                .outerRadius(radius * (1 - level*0.13))
                .innerRadius(radius * (0.9 - level*0.13))
				.cornerRadius(2);
			hoverArc = d3.arc()
                .outerRadius(radius * (1 - level*0.13))
                .innerRadius(radius * (0.9 - level*0.13) - 5)
				.cornerRadius(2);
			
			// append the svg object to the selection
			var svg = selection;
			
			var g = svg.append('g')
                .attr('transform', 'translate(' + (radius + 20) + ',' + (radius + 20) + ')')
				.attr("id", "chart" + level);
          
			// add loading transition and colour to the donut slices
			hoverBlocked = true;	
			var path = g.selectAll(".slice"  + level)
				.data(pie(data), function(d) { return d; })
				.enter().append("path")
					.attr("class", function(d) { return "slice" + level ;})
					.attr("fill", function(d) { return colour(d.data.key); })
					.transition()
					.duration(250)
					.attrTween("d", function(d) {
						var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
						return function(t) {
							d.endAngle = i(t); 
							return arc(d)
						}
					})
					.on("end", function() {hoverBlocked = false;}); 
          
            // add tooltip to mouse events on slices and labels
            d3.selectAll(".slice" + level).call(addHoverEventsHandler);
			d3.selectAll(".slice" + level).call(addSliceClickHandler);
			
			chart.addLegend();
            
			
            // Functions

            // function that creates and adds the tool tip to a selected element
            function addHoverEventsHandler(localSelection) {
				//we use localSelection, so that we don't overwrite selection

                localSelection.on('mouseenter', function (data) {
					if(!hoverBlocked) {
						addToolTip(data, selection);
						
						d3.select(this).transition()
								.duration(250)
								.attr("d", hoverArc)
					}
                });

                // remove the tooltip when mouse leaves the slice/label
                localSelection.on('mouseout', function () {
					if(!hoverBlocked) {
						removeToolTip();
						
						var slice = d3.select(this);
						slice.transition()
								.duration(250)
								.attr("d", arc);
					}
                });
            }
			
			// adds the tooltip element to the parent node (outside of the svg, for linebreaks)
			function addToolTip(data, selection) {
				d3.select(selection.node().parentNode).append("div")
					.attr("class", "tooltip")
					.attr("style", function(d) {
						var pos = arc.centroid(data);
						var svgpos = svg.node().getBoundingClientRect();
						
						
						return "left: " + (window.scrollX + svgpos.left + pos[0] + 20 + radius) + "px;"+
							" top :" + (window.scrollY + svgpos.top + pos[1] + 20 + radius) + "px;";
					})
				.html(toolTipHTML(data));
			}
			
			function removeToolTip() {
				d3.selectAll(".tooltip").remove();
			}
			
	
            // function to create the HTML string for the tool tip
            function toolTipHTML(data) {
				var str = column + ": <b>" + valueString(data.data.key) + "</b><br/><br/>";
				
				if(data.data.value == 1) 
					str += "1 Störung"
				else
					str += data.data.value + " Störungen" 
			
				return str;
            }
			
			// function that adds a click event to the selection, which then calls further functions (...)
            function addSliceClickHandler(sliceSelection) {
				
                sliceSelection.on("click", function (sliceData) {
					var selected = d3.select(this).attr("class").includes("sliceSelected");
					
					unselectSlices();
					resetLevel(level + 1);
					
					var data = rawData;
					
					if (selected) {	
						hideColumnPicker();
						
						removeSelectedSliceInformation(level);
					} else {
						d3.select(this)
							.attr("class", "slice" + level + " sliceSelected");
						
						data = restrictData(data, column, sliceData.data.key);
						
						addSelectedSliceInformation(level, valueString(sliceData.data.key), sliceData.startAngle);
						
						showColumnPicker();
					}
					
					
					updateColumnPicker(data);
					updateCentralPanel(data);
                });
            }
			
			// function that unselects all other slices
			function unselectSlices() {
				//important: no space between classes in css selector ("and")
				d3.selectAll(".slice" + level + ".sliceSelected")
					.attr("stroke", "none")
					.attr("class", "slice" + level);
			}
        });
		
    }
	
	
    // getter and setter functions

    chart.radius = function(value) {
        if (!arguments.length) return radius;
        radius = value;
        return chart;
    };
	
	chart.level = function(value) {
        if (!arguments.length) return level;
        level = value;
        return chart;
    };

    chart.colour = function(value) {
        if (!arguments.length) return colour;
        colour = value;
        return chart;
    };

    chart.column = function(value) {
        if (!arguments.length) return column;
        column = value;
        return chart;
    };
	
	// further public functions (accessible from outside)
	chart.rotate = function(angle) {
		hoverBlocked = true;
		
		d3.selectAll(".slice"  + level)
			.transition()
			.duration(1000)			
			.attrTween("d", tweenArc(function(d, i) {
				return {
					startAngle: d.startAngle + angle,
					endAngle: d.endAngle + angle
				};
			}))
			.on("end", function() {hoverBlocked = false;}); ;
		
		function tweenArc(b) {
			return function(a, i) {
				var d = b.call(this, a, i), i = d3.interpolate(a, d);
				for (var k in d) a[k] = d[k]; // update data
				return function(t) { return arc(i(t)); };
			};
		}
	}
					
	// adds a legend to the #legend div
	chart.addLegend = function() {
		var selection = d3.select("#legend .legendContainer")
			.selectAll(".legenditem")
			.data(data.sort(function(a,b) {return d3.descending(a.value, b.value)}), function(d) { return d.key });
		
		//enter
		var div = selection.enter().append("div")
			.attr("class", "legenditem")
			.on("mouseenter", function (legendData) {
					d3.selectAll(".slice"  + level)
						.filter(function(d) { return d.data.key == legendData.key;})
						.transition()
						.duration(250)
						.attr("d", hoverArc);
					d3.select(this)
						.style("opacity", 0.8);
				}
			)
			.on("mouseleave", function (legendData) {
					d3.selectAll(".slice"  + level)
						.filter(function(d) { return d.data.key == legendData.key;})
						.transition()
						.duration(250)
						.attr("d", arc);
					d3.select(this)
						.style("opacity", 1);
				}
			)
			.on("click", function(legendData) {
					d3.selectAll(".slice"  + level)
						.filter(function(d) { return d.data.key == legendData.key;})
						.dispatch("click");
				}
			);
			
		div.append("div")
			.style("background-color", function(d) { return colour(d.key); });
		div.append("span")
			.text(function(d) { return valueString(d.key); })
			.append("span")
				.attr("class", "description")
				.text(function(d) { return " " + descriptionString(d.key);});
		// update
		var div = selection
			.on("mouseenter", function (legendData) {
					d3.selectAll(".slice"  + level)
						.filter(function(d) { return d.data.key == legendData.key;})
						.transition()
						.duration(250)
						.attr("d", hoverArc);
					d3.select(this)
						.style("opacity", 0.8);
				}
			)
			.on("mouseleave", function (legendData) {
					d3.selectAll(".slice"  + level)
						.filter(function(d) { return d.data.key == legendData.key;})
						.transition()
						.duration(250)
						.attr("d", arc);
					d3.select(this)
						.style("opacity", 1);
				}
			)
			.on("click", function(legendData) {
					d3.selectAll(".slice"  + level)
						.filter(function(d) { return d.data.key == legendData.key;})
						.dispatch("click");
				}
			);
			
		div.select("div")
			.style("background-color", function(d) { return colour(d.key); });
		div.select("span")
			.text(function(d) { return valueString(d.key); })
			.append("span")
				.attr("class", "description")
				.text(function(d) { return " " + descriptionString(d.key);});
				
		// remove
		selection.exit().
			remove();
		
	}

    return chart;
}