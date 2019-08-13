var selectedColumns = []; // lists selected columns
var hiddenColumns = ["Techn. Platz", "Techn. Identitätsnr."];
	//those columns are only visible in the table, but not in the visualisation (e.g. Identitätsnr, which is unique)
var rawData;

d3.dsv(';','data/BernmobilStoerungen2018.csv').then(function(data) {
	rawData = data;
	updateColumnPicker(data);
	
	
	d3.select('#chart')
		.append("svg")
			.attr('width', 630)
            .attr('height', 630)
	
	d3.select("#centralPanel .all")
		.text(data.length);
});

/**
* updates the column picker panel (shows only buttons for columns which aren't already selected)
*/
function updateColumnPicker(data){
	// only display columns, which are not already selected
	var selectedCols = selectedColumns.map(function (d) {return d.key});

	var columns = data.columns.filter(
		function (d) {return selectedCols.indexOf(d) == -1 && hiddenColumns.indexOf(d) == -1;}
	);

	var selection = d3.select("#columnPicker")
		.selectAll(".columnPickerButton")
		.data(columns, function(d) { return d });
	
	// add buttons for each column
	selection.enter()
		.append("div")
			.text(function (d){return d})
			.attr("class","button columnPickerButton")
			.style("background-image", function(d) {
				if(iconInfo[d])
					return "url(" + iconInfo[d].icon.toString() + ")";
			})
			.on("click", function(d,i) { chooseColumn(data, d) });
	
	// update click event to the new data
	selection
		.on("click", function(d,i) { chooseColumn(data, d) });
	
	// remove already used columns
	selection.exit()
		.remove();
		
	// only show magic selection button, if no other columns are selected
	if(selectedColumns.length > 0)
		d3.select("#magicSelectionButton").style("display", "none");
	else
		d3.select("#magicSelectionButton").style("display", "inline-block");
}

/**
* creates a new inner donut chart for the selected column.
* - hides the column picker panel and shows the legend / selected columns panel
* - changes the style of outer donuts
*/
function chooseColumn(data, key) {
	var miniDonut = donutChart()
		.radius(300)
		.level(selectedColumns.length)
		.column(key);
	
	d3.select('#chart svg')
		.datum(data) // bind data to the div
		.call(miniDonut);
	
	selectedColumns.push({
		key: key,
		data: data,
		value: null,
		chart: miniDonut
	});
	refreshSelectedColumnsPanel();
	updateCentralPanel(data);
		
	showCentralPanelAndLegend();
	
	hideColumnPicker();
	
		
	// charts with lower level shold have another design
	if(selectedColumns.length > 1) {
		var level = selectedColumns.length - 2;
		d3.select("#chart" + level).
			attr("class", "secondaryChart");
		selectedColumns[level].chart.rotate(-selectedColumns[level].startAngle);
	}
}

/**
* shows the column picker panel (and hides the tutorial/message)
*/
function showColumnPicker(){
	if(selectedColumns.length < 4) {
		d3.select("#columnPicker")
			.transition()
			.style("visibility", "visible")
			.duration(250)
			.style("opacity", "1");
		d3.select("#columnPickerTutorial")
			.style("display", "none");
		d3.select("#columnPickerMessage")
			.style("display", "none");
	} else {
		d3.select("#columnPickerMessage")
			.style("display", "block");
		d3.select("#columnPickerTutorial")
			.style("display", "none");
	}
}

/**
* hides the column picker panel (and shows the tutorial/message)
*/
function hideColumnPicker(){
	d3.select("#columnPicker")
		.transition()
		.duration(250)
		.style("opacity", "0")
		.style("visibility", "hidden");
	d3.select("#columnPickerTutorial")
		.style("display", "block");
	d3.select("#columnPickerMessage")
		.style("display", "none");
}

function hideCentralPanelAndLegend() {
	d3.select("#centralPanel")
		.style("display", "none"); // hide central panel
		
	d3.select("#legend")
		.style("display", "none"); //hide legend
}

function showCentralPanelAndLegend() {
	d3.select("#centralPanel")
		.style("display", "block"); // show central panel
		
	d3.select("#legend")
		.style("display", "inline-block"); //show legend
}

/**
* returns all rows from data, which have the specified value in the specified column
*/
function restrictData(data, column, value){
	var restrictedData;
	if(columnInfo[column] && columnInfo[column].mappingFunction)
		restrictedData = data.filter(function (d) {return columnInfo[column].mappingFunction(d[column]) == value;});
	else
		restrictedData = data.filter(function (d) {return d[column] == value;});
	
	//add columns attribute from original data array
	restrictedData.columns = data.columns;
	
	return restrictedData;
}

/**
* removes charts with level even or higher than the specified level.
*/
function resetLevel(level){
	//remove the inner circles
	var i;
	for(i = level; i < selectedColumns.length + 1;  i++){
		d3.select("#chart" + i)
			.remove();
	}
	
	var lowerLevelData = rawData;
	
	// remove the selected columns from the array
	if (selectedColumns.length > level) {
		lowerLevelData = selectedColumns[level].data; //this is one level too high, but it's the restricted data of the lower level, if some slice is selected
		selectedColumns.splice(level, selectedColumns.length - level);
		
		refreshSelectedColumnsPanel();
	}
	
	// remove secondaryChart class for the new active chart
	if (selectedColumns.length > 0) {
		d3.select("#chart" + (level - 1)).
			attr("class", "");
	}
	
	// hide/update legend and central panel
	if(level > 0) {
		selectedColumns[level - 1].chart.addLegend();
	} else {
		hideCentralPanelAndLegend();
		
	}
	
	// show column picker
	showColumnPicker();
	
	updateColumnPicker(lowerLevelData); //update column picker with restricted data from lower level
	updateCentralPanel(lowerLevelData); //update centralPanel with restricted data from lower level
}

/**
* refreshes the Panel which displays all selected columns
*/
function refreshSelectedColumnsPanel() {
	var selection = d3.select("#selectedColumnsPanel")
		.selectAll(".selectedColumnsButton")
		.data(selectedColumns);
	
	//enter
	var div = selection.enter()
		.append("div").attr("class", "selectedColumnsButton");
	div.on("click", 
			function(e,i){
				resetLevel(i);
			}
		)
		.append("div")
			.attr("class", "text")
				.text(function (d){return d.key})
			.style("background-image", function(d) {
				if(iconInfo[d.key])
					return "url(" + iconInfo[d.key].icon.toString() + "), url(./icons/close2.png)";
			})
	div.append("div")
			.attr("class", "subbutton")
			.style("display", function (d) {return d.valueString ? "block" : "none";})
			.text(function (d){return d.valueString});
	
	//update
	selection.selectAll(".subbutton")
		.style("display", function (d) {return d.valueString ?  "block" : "none";})
		.text(function (d){return d.valueString})
	
	//exit
	selection.exit()
		.remove();
}

/**
* adds information about the selected slice to selectedColumns
*/
function addSelectedSliceInformation(level, valueString, startAngle){
	selectedColumns[level].valueString = valueString;
	selectedColumns[level].startAngle = startAngle;
	
	refreshSelectedColumnsPanel();
}

/**
* removes information about the selected slice to selectedColumns
*/
function removeSelectedSliceInformation(level){
	selectedColumns[level].valueString  = null;
	
	refreshSelectedColumnsPanel();
}

/**
* refreshes the data, which can be displayed with the table and the central panel counter
*/
function updateCentralPanel(data) {
	d3.select("#showTableButton")
		.on("click", function () {showTable(data)});
		
	// update the counter in centralPanel
	d3.select("#centralPanel .highlight")
		.text(data.length);
}

/**
* generates the table and shows the tableContainer
*/
var scrollPosition = 0;
function showTable(data) {
	scrollPosition = document.documentElement.scrollTop;
	
	tabulate(data);
	d3.select("#tableContainer")
		.style("display", "block");
	d3.select("#main")
		.style("display", "none");
	
		
	//scroll to the top of the page (table dialog)
	document.documentElement.scrollTop = 0;
}

/**
* create a csv file from the specified data and show a download prompt
*/
function downloadCsv(data) {
	// generate CSV
	var columns = data.columns;
	var csv = [columns.join(";")];
	
	data.forEach(function(row) {
		var line = [];
		
		columns.forEach(function (col) {
			line.push(row[col]);
		});
		
		csv.push(line.join(";"))
	});
	
	// create hidden link element to use its download attribute
	var element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv.join("\r\n")));
    element.setAttribute('download', "data.csv");

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

/**
* hides the tableContainer
*/
function closeDialog() {
	d3.select("#tableContainer")
		.style("display", "none");
	d3.select("#main")
		.style("display", "block");
	document.documentElement.scrollTop = scrollPosition;
}

/**
* magic selection
*/
function magicSelection(index) {
	if(index < 2) {
	
		var max = rawData.columns.length - selectedColumns.length - hiddenColumns.length - 1;
		var randomColIndex = Math.round(Math.random() * max, 0);
		
		d3.selectAll(".columnPickerButton")
			.filter(function(d, i) { return i == randomColIndex;})
			.dispatch("click");
		
		max = d3.selectAll(".slice" + index).size() - 1;
		var randomSliceIndex = Math.round(Math.random() * max, 0);
		
		d3.selectAll(".slice" + index)
			.filter(function(d, i) { return i == randomSliceIndex;})
			.dispatch("click");
		
		window.setTimeout(function () {magicSelection(index + 1)}, 1000);
	}
}