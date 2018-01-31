/*
 * To make the graph scale correctly when you have 2 curves:
 * yScale.domain([0, d3.max(data, function(d) {
 * 		return Math.max(d.column1, d.column2); })]);
 */

let margin = {top: 50, right: 20, bottom: 80, left: 50};
let width = 960 - margin.left - margin.right;
let height = 500 - margin.top - margin.bottom;

let parseDate = d3.timeParse("%Y-%m-%d");

let xScale = d3.scaleTime(). range([0, width]);
let LDL_C_yScale = d3.scaleLinear().range([height, 0]);
let HDL_C_yScale = d3.scaleLinear().range([height, 0]);
let TC_yScale = d3.scaleLinear().range([height, 0]);
let TAG_yScale = d3.scaleLinear().range([height, 0]);
let yScale = d3.scaleLinear().range([height, 0]);

// prep the lipid chart
let LDL_C_basisline = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return xScale(d.date); })
	.y(function(d) { return LDL_C_yScale(d.LDL_C); });

let lipid_chart = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the data and populate the charts
d3.csv("Bloodwork_hfh.csv", function(error, data) {
	if (error) console.log("no data");

	// format the incoming data
	data.forEach(function(d) {
		d.date = parseDate(d.date);
		d.LDL_C = +d.LDL_C;
		d.HDL_C = +d.HDL_C;
		d.TC = +d.TC;
		d.TAG = +d.TAG;	
	});
	
	let xLabels = data.map(function(d) {return d.date; });

	// scale the X range
	xScale.domain([xLabels[0], xLabels[xLabels.length -1]]);
	// scale the Y range based on the smallest and largest values
	yScale.domain([
		d3.min(data, function(d) { return Math.min(d.LDL_C, d.HDL_C, d.TC, d.TAG)}),
		d3.max(data, function(d) { return Math.max(d.LDL_C, d.HDL_C, d.TC, d.TAG)}),
	]);

	// make scatter points, "__dot" is the label for the svg group of them
	lipid_chart.selectAll("LDL_C_dots")
			.data(data)
		.enter().append("circle")
			.attr("class", "LDLdots")
			.attr("r", 3)
			.attr("cx", function(d) { return xScale(d.date); })
			.attr("cy", function(d) { return yScale(d.LDL_C); })

	// draw a curvy line
	lipid_chart.append("path")
		.data([data])
		.attr("class", "line")
		.attr("d", LDL_C_basisline);
			
	// add x axis
	lipid_chart.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale));
	
	// label the x axis
	lipid_chart.append("text")
		.attr("transform", 
			"translate(" + (width/2 - 100) + "," + (height + margin.top) + ")")
		.text("Date");

	// add y axis
	lipid_chart.append("g")
		.attr("class", "axis")
		.call(d3.axisLeft(LDL_C_yScale));
});
