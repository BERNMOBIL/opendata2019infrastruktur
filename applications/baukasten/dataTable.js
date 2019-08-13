/**
* generates/updates the table with the given data (updates also the download csv button)
*/
function tabulate(data) {
	var table = d3.select("#table");
	var thead = table.select("thead");
	var	tbody = table.select("tbody");
	var columns = data.columns;

	// append the header row
	var colSelection = thead.select("tr")
		.selectAll("th")
		.data(columns, function (d) {return d;});
	 
	//enter
	colSelection.enter()
		.append("th")
		.text(function (d) {return d;})
		.on("click", function(d) {
			if(this.className.includes("descending")) {
				tabulate(data.sort(function(a,b) {return d3.ascending(a[d], b[d])}));
				removeAllTriangles();
				this.className = "ascending";
			} else {
				tabulate(data.sort(function(a,b) {return d3.descending(a[d], b[d])}));
				removeAllTriangles();
				this.className = "descending";
			};
		});

	//update
	colSelection
		.text(function (d) {return d;})
		.on("click", function(d) {
			if(this.className.includes("descending")) {
				tabulate(data.sort(function(a,b) {return d3.ascending(a[d], b[d])}));
				removeAllTriangles();
				this.className = "ascending";
			} else {
				tabulate(data.sort(function(a,b) {return d3.descending(a[d], b[d])}));
				removeAllTriangles();
				this.className = "descending";
			};
		});
		
	//exit
	colSelection.exit()
		.remove();
	
	// create a row for each object in the data
	var rowsSelection = tbody.selectAll("tr")
		.data(data);
		
	// enter
	rowsSelection.enter()
		.append("tr")
		.selectAll("td")
		.data(
			function (row) {
				return columns.map(function (column) {
					return {column: column, value: row[column]};
				});
			}
		)
		.enter()
		.append("td")
			.text(function (d) { return d.value; });
	
	// update
	rowsSelection.selectAll("td")
		.data(
			function (row) {
				return columns.map(function (column) {
					return {column: column, value: row[column]};
				});
			}
		)
		.text(function (d) { return d.value; });
	// exit 
	rowsSelection.exit()
		.remove();

	// update the counter
	d3.select("#countPanel")
		.text(function () {
				if(data.length == 0)
					return "Es wird keine Störung angezeigt.";
				else if(data.length == 1)
					return "Es wird eine Störung angezeigt.";
				else 
					return "Es werden " + data.length + " Störungen angezeigt. Durch Klicken auf die Spalten lassen sich die Werte sortieren.";
				}
			);
	// update the download csv button
	d3.select("#csvDataDownloadButton")
		.on("click", function () {downloadCsv(data)});
	
	removeAllTriangles();
	
	return table;
}

/**
* removes all triangles (ascending/descending) from other theaders
*/
function removeAllTriangles() {
	d3.select("#tableContainer .ascending")
		.attr("class","");
	d3.select("#tableContainer .descending")
		.attr("class","");
}