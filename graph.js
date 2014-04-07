
drawGraph = function(input, to){

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
  width = 800 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

  var data = input.data,
    current = input.current;

  console.log(input);
  var xData = _.pluck(data, 'key')
  var x = d3.scale.linear()
  .range([0, width])
  //.domain(_.pluck(data, 'key'))
  .domain([d3.min(xData), d3.max(xData)]);
  ;

  var yData = _.pluck(data, 'value')
  var y = d3.scale.linear()
  .range([height, 0])
  .domain([0, d3.max(yData)]);
  ;

  var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  ;

  var svg = d3.select(to).append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

  svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  // .append("text")
  // .attr("transform", "rotate(-90)")
  // .attr("y", 6)
  // .attr("dy", ".71em")
  // .style("text-anchor", "end")
  // .text("Warp Occupancy")
  ;

  svg.selectAll(".bar")
  .data(data)
  .enter()
  .append("circle")
  .attr("class", "bar")
  .attr("cx", function(d) { return x(d.key); })
  // .attr("dx", x.rangeBand())
  .attr('r', 2)
  // .attr('dy', 10)
  .attr("cy", function(d) { return y(d.value); })
  // .attr("dy", function(d) { return height - y(d.value); });
  console.log(current)
  svg.selectAll(".current")
  .data([current])
  .enter()
  .append("circle")
  .attr("class", "current")
  .attr("cx", function(d) { return x(d.key); })
  .attr('r', 2)
  .attr("cy", function(d) { return y(d.value); })


}

drawGraph1 = function(input, to){
		/* implementation heavily influenced by http://bl.ocks.org/1166403 */
		
		// define dimensions of graph
		var m = [80, 80, 80, 80]; // margins
		var w = 1000 - m[1] - m[3]; // width
		var h = 400 - m[0] - m[2]; // height
		
		// create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
		var data = input.data;
		var xData = _.pluck(data, 'key')
		var yData = _.pluck(data, 'value')
		//var data = [3, 6, 2, 7, 5, 2, 0, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7];
		var current = input.current;
		console.log('xData:' + xData );
		console.log('yData:' + yData );

		// X scale will fit all values from data[] within pixels 0-w
		var x = d3.scale.linear().domain([d3.min(xData), d3.max(xData)]).range([0, w]);
		// Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
		var y = d3.scale.linear().domain([0, d3.max(yData)]).range([h, 0]);
			// automatically determining max range can work something like this
			// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

		// create a line function that can convert data[] into x and y points
		var line = d3.svg.line()
			// assign the X function to plot our line as we wish
			.x(function(d) { 
				// verbose logging to show what's actually being done
				//console.log('Plotting X value for data point: ' + d.key + ' to be at: ' + x(d.key) + ' using our xScale.');
				// return the X coordinate where we want to plot this datapoint
				return x(d.key); //d.key); 
			})
			.y(function(d) { 
				// verbose logging to show what's actually being done
				//console.log('Plotting Y value for data point: ' + d.value + ' to be at: ' + y(d.value) + " using our yScale.");
				// return the Y coordinate where we want to plot this datapoint
				return y(d.value); 
			})

			// Add an SVG element with the desired dimensions and margin.
			var graph = d3.select(to).append("svg:svg")
			      .attr("width", w + m[1] + m[3])
			      .attr("height", h + m[0] + m[2])
			    .append("svg:g")
			      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

			// create yAxis
			var xAxis = d3.svg.axis().scale(x).tickSize(-8/*-h*/).tickSubdivide(32); //true);
			// Add the x-axis.
			graph.append("svg:g")
			      .attr("class", "x axis")
			      .attr("transform", "translate(0," + h + ")")
			      .call(xAxis);

			// create left yAxis
			var yAxisLeft = d3.svg.axis().scale(y).tickSize(-w-20).tickSubdivide(true).ticks(4).orient("left"); 
			// Add the y-axis to the left
			graph.append("svg:g")
			      .attr("class", "y axis")
			      .attr("transform", "translate(-25,0)")
			      .call(yAxisLeft);

			//add x axis albel.
			graph.append("text")
				.attr("class", "x label")
				.attr("text-anchor", "end")
				.attr("x", w)
				.attr("y", h - 6)
				.text(input.xlabel);
				//.text("Threads per Block");
			//*/

			graph.append("text")
				.attr("class", "y label")
				.attr("text-anchor", "end")
				.attr("y", 6)
				.attr("dy", ".75em")
				.attr("transform", "rotate(-90)")
				.attr("transform", "translate(-25,0)")
				.text("# warps");

  			// Add the line by appending an svg:path element with the data line we created above
			// do this AFTER the axes above so that the line is above the tick-lines
  			graph.append("svg:path").attr("d", line(data));

}
