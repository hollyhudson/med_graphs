/*
 * To make the graph scale correctly when you have 2 curves:
 * yScale.domain([0, d3.max(data, function(d) {
 * 		return Math.max(d.column1, d.column2); })]);
 */

const RATIO_RISK_VALUE = 3.5; // TC_HDL ratio max healthy value

let margin = {top: 50, right: 20, bottom: 80, left: 50};
let width = 960 - margin.left - margin.right;
let height = 700 - margin.top - margin.bottom;

let parseDate = d3.timeParse("%Y-%m-%d");

let xScale = d3.scaleTime().range([0, width]);
let lipid_yScale = d3.scaleLinear().range([height, 0]);
let ratio_yScale = d3.scaleLinear().range([height, 0]);

/*** prep the lipid chart ***/


// create a risk area to fill
// "d" here just refers to the data that we'll eventually get(?)
let risk_area = d3.area()
	.x(function(d) { return xScale(d.date); })
	.y0(function(d) { return ratio_yScale(RATIO_RISK_VALUE); })
	.y1(0);

// create plot lines
let LDL_C_basisline = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return xScale(d.date); })
	.y(function(d) { return lipid_yScale(d.LDL_C); });

let HDL_C_basisline = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return xScale(d.date); })
	.y(function(d) { return lipid_yScale(d.HDL_C); });

let TC_basisline = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return xScale(d.date); })
	.y(function(d) { return lipid_yScale(d.TC); });

let TAG_basisline = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return xScale(d.date); })
	.y(function(d) { return lipid_yScale(d.TAG); });

let lipid_chart = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// prep the ratio chart
let ratio_basisline = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return xScale(d.date); })
	.y(function(d) { return ratio_yScale(d.TC_HDL_ratio); });

let ratio_chart = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the data and populate the charts
d3.csv("Bloodwork_tbh.csv", function(error, data) {
	if (error) console.log("no data");

	// format the incoming data
	data.forEach(function(d) {
		d.date = parseDate(d.date);
		d.TC_HDL_ratio = +d.TC_HDL_ratio;
		d.LDL_C = +d.LDL_C;
		d.HDL_C = +d.HDL_C;
		d.TC = +d.TC;
		d.TAG = +d.TAG;	
	});
	
	let xLabels = data.map(function(d) {return d.date; });

	// scale the X range
	xScale.domain([xLabels[0], xLabels[xLabels.length -1]]);
	// scale the Y range based on the smallest and largest values
	lipid_yScale.domain([
		d3.min(data, function(d) { return Math.min(d.LDL_C, d.HDL_C, d.TC, d.TAG)}),
		d3.max(data, function(d) { return Math.max(d.LDL_C, d.HDL_C, d.TC, d.TAG)}),
	]);
	ratio_yScale.domain([2.5, 4.5]);

	/****** Lipid Chart *********/

	// make scatter points, "__dot" is the label for the svg group of them
	lipid_chart.selectAll("LDL_C_dots")
			.data(data)
		.enter().append("circle")
			.attr("class", "LDL_C_points")
			.attr("r", 3)
			.attr("cx", function(d) { return xScale(d.date); })
			.attr("cy", function(d) { return lipid_yScale(d.LDL_C); })

	lipid_chart.selectAll("HDL_C_dots")
			.data(data)
		.enter().append("circle")
			.attr("class", "HDL_C_points")
			.attr("r", 3)
			.attr("cx", function(d) { return xScale(d.date); })
			.attr("cy", function(d) { return lipid_yScale(d.HDL_C); })

	lipid_chart.selectAll("TC_dots")
			.data(data)
		.enter().append("circle")
			.attr("class", "TC_points")
			.attr("r", 3)
			.attr("cx", function(d) { return xScale(d.date); })
			.attr("cy", function(d) { return lipid_yScale(d.TC); })

	lipid_chart.selectAll("TAG_dots")
			.data(data)
		.enter().append("circle")
			.attr("class", "TAG_points")
			.attr("r", 3)
			.attr("cx", function(d) { return xScale(d.date); })
			.attr("cy", function(d) { return lipid_yScale(d.TAG); })

	// draw a curvy line
	lipid_chart.append("path")
		.data([data])
		.attr("class", "LDL_C_line")
		.attr("d", LDL_C_basisline);
			
	// draw a curvy line
	lipid_chart.append("path")
		.data([data])
		.attr("class", "HDL_C_line")
		.attr("d", HDL_C_basisline);
			
	// draw a curvy line
	lipid_chart.append("path")
		.data([data])
		.attr("class", "TC_line")
		.attr("d", TC_basisline);
			
	// draw a curvy line
	lipid_chart.append("path")
		.data([data])
		.attr("class", "TAG_line")
		.attr("d", TAG_basisline);
			
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
		.call(d3.axisLeft(lipid_yScale));

	/****** Ratio Chart *********/
	ratio_chart.selectAll("ratio_dots")
			.data(data)
		.enter().append("circle")
			.attr("class", "ratio_points")
			.attr("r", 3)
			.attr("cx", function(d) { return xScale(d.date); })
			.attr("cy", function(d) { return ratio_yScale(d.TC_HDL_ratio); });
	
	// Add risk factor line
	ratio_chart.append("g")
		.attr("class", "ratio_riskline")
		.call(d3.axisLeft(ratio_yScale)
			.tickValues([RATIO_RISK_VALUE])
			.tickSize(-width)
			.tickFormat(""));

	// add risk area fill
	ratio_chart.append("path")
		.data([data])
		.attr("class", "risk_area")
		.attr("d", risk_area);

	// draw a curvy line
	ratio_chart.append("path")
		.data([data])
		.attr("class", "ratio_line")
		.attr("d", ratio_basisline);
			
	// add x axis
	ratio_chart.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale));
	
	// label the x axis
	ratio_chart.append("text")
		.attr("transform", 
			"translate(" + (width/2 - 100) + "," + (height + margin.top) + ")")
		.text("Date");

	// add y axis
	ratio_chart.append("g")
		.attr("class", "axis")
		.call(d3.axisLeft(ratio_yScale));
});
