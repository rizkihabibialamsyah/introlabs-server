var n = 60,
    random = d3.randomUniform(50, 55),
    dataS = d3.range(n).map(() => {return 0;}),
    dataT = d3.range(n).map(() => {return 0;});
    dataP = d3.range(n).map(() => {return 0;});

var svgS = d3.select("#nav-speed > svg"),
    svgT = d3.select("#nav-temp > svg"),
    svgP = d3.select("#nav-press > svg"),
    margin = {top: 20, right: 20, bottom: 20, left: 40},
    widthS = +svgS.attr("width") - margin.left - margin.right,
    heightS = +svgS.attr("height") - margin.top - margin.bottom,
    widthT = +svgT.attr("width") - margin.left - margin.right,
    heightT = +svgT.attr("height") - margin.top - margin.bottom,
    widthP = +svgP.attr("width") - margin.left - margin.right,
    heightP = +svgP.attr("height") - margin.top - margin.bottom,
    gS = svgS.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    gT = svgT.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    gP = svgP.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var xS = d3.scaleLinear()
    .domain([0, n - 1])
    .range([0, widthS]);

var yS = d3.scaleLinear()
    .domain([0, 500])
    .range([heightS, 0]);

var lineS = d3.line()
    .x(function(d, i) { return xS(i); })
    .y(function(d, i) { return yS(d); });

var xT = d3.scaleLinear()
    .domain([0, n - 1])
    .range([0, widthT]);

var yT = d3.scaleLinear()
    .domain([0, 100])
    .range([heightT, 0]);

var lineT = d3.line()
    .x(function(d, i) { return xT(i); })
    .y(function(d, i) { return yT(d); });

var xP = d3.scaleLinear()
    .domain([0, n - 1])
    .range([0, widthP]);

var yP = d3.scaleLinear()
    .domain([0, 9])
    .range([heightP, 0]);

var lineP = d3.line()
    .x(function(d, i) { return xP(i); })
    .y(function(d, i) { return yP(d); });

gS.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", widthS)
    .attr("height", heightS);

gS.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + yS(0) + ")")
    .call(d3.axisBottom(xS));

gS.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(yS));

gS.append("g")
    .attr("clip-path", "url(#clip)")
  .append("path")
    .datum(dataS)
    .attr("class", "line")
  .transition()
    .duration(1000)
    .ease(d3.easeLinear)
    .on("start", tickS);


gT.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", widthT)
    .attr("height", heightT);

gT.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + yT(0) + ")")
    .call(d3.axisBottom(xT));

gT.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(yT));

gT.append("g")
    .attr("clip-path", "url(#clip)")
  .append("path")
    .datum(dataT)
    .attr("class", "line")
  .transition()
    .duration(1000)
    .ease(d3.easeLinear)
    .on("start", tickT);


gP.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", widthP)
    .attr("height", heightP);

gP.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + yP(0) + ")")
    .call(d3.axisBottom(xP));

gP.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(yP));

gP.append("g")
    .attr("clip-path", "url(#clip)")
  .append("path")
    .datum(dataP)
    .attr("class", "line")
  .transition()
    .duration(1000)
    .ease(d3.easeLinear)
    .on("start", tickP);

function tickS() {

  // Push a new data point onto the back.
  let val = sensorData.speed;

  $("body > div > div:nth-child(1) > div:nth-child(2) > div > div.row.h-100 > div.col > div:nth-child(3) > div > div.text.primary.fs-1").html(val.toFixed(2));

  dataS.push(val);

  // Redraw the line.
  d3.select(this)
      .attr("d", lineS)
      .attr("transform", null);

  // Slide it to the left.
  d3.active(this)
      .attr("transform", "translate(" + xS(-1) + ",0)")
    .transition()
      .on("start", tickS);

  // Pop the old data point off the front.
  dataS.shift();

}

function tickT() {

  // Push a new data point onto the back.
  let val = sensorData.temp;

  $("body > div > div:nth-child(1) > div:nth-child(2) > div > div.row.h-100 > div.col > div:nth-child(4) > div > div.text.primary.fs-1").html(val.toFixed(2));

  dataT.push(val);

  // Redraw the line.
  d3.select(this)
      .attr("d", lineT)
      .attr("transform", null);

  // Slide it to the left.
  d3.active(this)
      .attr("transform", "translate(" + xT(-1) + ",0)")
    .transition()
      .on("start", tickT);

  // Pop the old data point off the front.
  dataT.shift();

}


function tickP() {

  // Push a new data point onto the back.
  let val = sensorData.press;

  $("body > div > div:nth-child(1) > div:nth-child(2) > div > div.row.h-100 > div.col > div:nth-child(5) > div > div.text.primary.fs-1").html(val.toFixed(2));

  dataP.push(val);

  // Redraw the line.
  d3.select(this)
      .attr("d", lineP)
      .attr("transform", null);

  // Slide it to the left.
  d3.active(this)
      .attr("transform", "translate(" + xP(-1) + ",0)")
    .transition()
      .on("start", tickP);

  // Pop the old data point off the front.
  dataP.shift();

}
