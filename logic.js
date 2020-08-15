var startYear = 1935;
var endYear = 2015;
var currentYear = startYear;
var width = 975;
var height = 610;

///////////////////////////////////////////////////
// this is d3.geo.mercator() or d3.geo.albers() equavilent
//var projection = d3.geoAlbersUsa().scale(1300).translate([500, 300]); // for D3 v4
var projection = d3.geo.albersUsa().scale(1200).translate([500, 310]); // for D3 v3
// projection path for "d" element to be passed to D3
var path = d3.geo.path().projection(projection); // for D3 v3
//var path = d3.geoPath().projection(projection); // for D3 v4
///////////////////////////////////////////////////

var svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
var ufoDat;
var toolTip;
var firstClick = true;

drawMap();

showData();

createSlider();

function createSlider() {
  d3.select("#slider").call(
    chroniton() // this call the chroniton JS library for the slider player component
      .domain([new Date(startYear, 1, 1), new Date(endYear, 1, 1)])
      .labelFormat(function (date) {
        return Math.ceil(date.getFullYear() / 1) * 1;
      })
      .width(600)
      .on("change", function (date) {
        var newYear = Math.ceil(date.getFullYear() / 1) * 1;
        if (newYear != currentYear) {
          currentYear = newYear;
          // circle
          // 	.remove();
          //update(currentYear,true);

          if (firstClick) {
            //svg.selectAll("circle").attr("fill-opacity", 0).attr("stroke-opacity", 0);
            svg.selectAll("circle").remove();
            firstClick = false;
          }
          createCirclesByYear(ufoData, toolTip, currentYear)
          console.log(currentYear);
        }
      })
      .playButton(true)
      .playbackRate(0.5)
      .loop(false)
  );
}

function createTooltip() {
  // Step 7: Initialize tool tip
  // ==============================
  var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    .attr("opacity", 0.5)
    .offset([0, 0])
    .html((d) => {
      return `<u><b>(${d.country.toUpperCase()}) ${
        d.city
      }, ${d.state.toUpperCase()} [${d.lng}, ${d.lat}]</b></u><br/>Date: ${
        d.date
      }<br/>Shape: ${d.shape}, Duration: ${d.duration / 60} minutes <br/> ${
        d.comments
      }`;
    });
  return toolTip;
}

async function drawMap() {
  //https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json
  //https://gist.githubusercontent.com/mbostock/4090846/raw/07e73f3c2d21558489604a0bc434b3a5cf41a867/us-congress-113.json
await  d3.json(
    "https://gist.githubusercontent.com/mbostock/4090846/raw/07e73f3c2d21558489604a0bc434b3a5cf41a867/us.json",
    function (error, topojsonData) {
      console.log(topojsonData);
      // change topojsonData.objects.states to topojsonData.objects.districts if using us-congress-113.json instead of us.json
      var us = topojson.feature(topojsonData, topojsonData.objects.states);
      console.log(us);
      console.log(us.features);
      svg
        .selectAll(".region")
        .data(us.features)
        .enter()
        .append("path")
        // the actual projection path
        .attr("d", path)
        .attr("class", "region")
        .style("opacity", ".8")
        .style("fill", "slategrey")
        .style("stroke", "white")
        .style("stroke-width", "0.5px")
        .on("mouseover", function (d, i) {
          d3.select(this).transition().duration(500).style("fill", "#808080");
        })
        .on("mouseout", function (d, i) {
          //d3.select(this).interrupt();
          d3.select(this).transition().duration(2000).style("fill", "slategrey");
        });

      // this is the map composition borders for Alaska(02) & Hawaii(15)
      svg
        .append("path")
        .style("fill", "none")
        .style("stroke", "black")
        .attr("d", projection.getCompositionBorders());
    }
  );
}

function showData() {
  d3.csv("us16800ufoData.csv",
    function (cvsData) {
      ufoData = cvsData;
      console.log(ufoData);
      console.log(ufoData[0].year);
      ufoData.sort((a, b) => a.year - b.year);
      
      //var parseDate = d3.timeParse("%m/%d/%Y %H:%M"); // for D3 v4
      var parseDate = d3.time.format("%m/%d/%Y %H:%M").parse; // for D3 v3

      ufoData.forEach((data) => {
        data.lng = +data.lng;
        data.lat = +data.lat;
        data.duration = +data.duration;
        data.date = parseDate(data.date);
        data.year = +data.year;
      });

      toolTip = createTooltip();

      var circles = createCircles(ufoData, toolTip);
      //var circles = createCirclesByYear(ufoData, toolTip, 2010);
      //console.log(circles);

      svg.call(toolTip);

      console.log(ufoData);
      console.log(ufoData[0].year);
    }
  );
}

function createCircles(ufoData, toolTip) {
  var circles = svg 
        .selectAll("circle")
        .data(ufoData);  // import data for ALL year

        circles.enter()
        .append("circle")
        .on("mouseover", (data) => {
          toolTip.show(data, this);
        })
        .on("mouseout", (data) => {
          toolTip.hide(data);
        })
        .attr("cx", function (d) {
          if (projection([d.lng, d.lat])) return projection([d.lng, d.lat])[0];
        })
        .attr("cy", function (d) {
          if (projection([d.lng, d.lat])) return projection([d.lng, d.lat])[1];
        })
        //.attr("r", 0.1)
        .attr("r", (d) => {
          var myInterpolator = d3.interpolateNumber(0.1, d.duration * 0.001);
          return myInterpolator(0.2);
        })
        .attr("fill", "purple")
        .attr("fill-opacity", 0.6)
        .attr("stroke", "purple")
        .attr("stroke-opacity", 0.6)
        .transition()
        .ease("linear")
        .duration(2000)
        .attr("r", (d) => {
          var myInterpolator = d3.interpolateNumber(0.1, d.duration * 0.001);
          return myInterpolator(0.4);
        })
        .attr("fill", "purple")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "purple")
        .attr("stroke-opacity", 0.5)
        .transition()
        .ease("linear")
        .duration(1000)
        .attr("r", (d) => {
          var myInterpolator = d3.interpolateNumber(0.1, d.duration * 0.001);
          return myInterpolator(0.6);
        })
        .attr("fill", "purple")
        .attr("fill-opacity", 0.4)
        .attr("stroke", "purple")
        .attr("stroke-opacity", 0.4)
        .transition()
        .ease("linear")
        .duration(1000)
        .attr("r", (d) => {
          var myInterpolator = d3.interpolateNumber(
            0.1,
            d.duration < 1 ? 1 : d.duration * 0.001
          );
          return myInterpolator(0.8);
        })
        //.attr("r", function(d) {return (d.duration<1) ? 1 : (d.duration*0.001);})
        .attr("fill", "purple")
        .attr("fill-opacity", 0.3)
        .attr("stroke", "purple")
        .attr("stroke-opacity", 0.3)
        .transition()
        .ease("linear")
        .duration(2000)
        .attr("r", function (d) {
          return d.duration < 1 ? 1 * 0.001 : d.duration * 0.001;
        })
        .attr("fill", "purple")
        .attr("fill-opacity", 0.2)
        .attr("stroke", "purple")
        .attr("stroke-opacity", 0.2);
      //.text(d => d.duration*0.0001);
  console.log(circles)
  return circles;
}

function createCirclesByYear(ufoData, toolTip, year) {
  var circles = svg 
        .selectAll("circle")
        .data(ufoData.filter(function(d) { return d.year == year; })
          .sort((a, b) => a.duration - b.duration)
        );  // import data for ALL year
        
        circles.enter()
        .append("circle")
        .on("mouseover", (data) => {
          toolTip.show(data, this);
        })
        .on("mouseout", (data) => {
          toolTip.hide(data);
        })
        .attr("cx", function (d) {
          if (projection([d.lng, d.lat])) return projection([d.lng, d.lat])[0];
        })
        .attr("cy", function (d) {
          if (projection([d.lng, d.lat])) return projection([d.lng, d.lat])[1];
        })
        //.attr("r", 0.1)
        .attr("r", (d) => {
          var myInterpolator = d3.interpolateNumber(0.1, d.duration * 0.001);
          return myInterpolator(0.2);
        })
        .attr("fill", "purple")
        .attr("fill-opacity", 0.6)
        .attr("stroke", "purple")
        .attr("stroke-opacity", 0.6)
        .transition()
        .ease("linear")
        .duration(2000)
        .attr("r", (d) => {
          var myInterpolator = d3.interpolateNumber(0.1, d.duration * 0.001);
          return myInterpolator(0.4);
        })
        .attr("fill", "purple")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "purple")
        .attr("stroke-opacity", 0.5)
        .transition()
        .ease("linear")
        .duration(1000)
        .attr("r", (d) => {
          var myInterpolator = d3.interpolateNumber(0.1, d.duration * 0.001);
          return myInterpolator(0.6);
        })
        .attr("fill", "purple")
        .attr("fill-opacity", 0.4)
        .attr("stroke", "purple")
        .attr("stroke-opacity", 0.4)
        .transition()
        .ease("linear")
        .duration(1000)
        .attr("r", (d) => {
          var myInterpolator = d3.interpolateNumber(
            0.1,
            d.duration < 1 ? 1 : d.duration * 0.001
          );
          return myInterpolator(0.8);
        })
        //.attr("r", function(d) {return (d.duration<1) ? 1 : (d.duration*0.001);})
        .attr("fill", "purple")
        .attr("fill-opacity", 0.3)
        .attr("stroke", "purple")
        .attr("stroke-opacity", 0.3)
        .transition()
        .ease("linear")
        .duration(2000)
        .attr("r", function (d) {
          return d.duration < 1 ? 1 * 0.001 : d.duration * 0.001;
        })
        .attr("fill", "purple")
        .attr("fill-opacity", 0.2)
        .attr("stroke", "purple")
        .attr("stroke-opacity", 0.2);
      //.text(d => d.duration*0.0001);
  console.log(circles)
  return circles;
}

function createCirclesByYear2(ufoData, toolTip, year) {
  var circles = svg
        .selectAll("circle")
        .data(ufoData.filter(function(d) { return d.year == year; }));

        circles.enter()
        .append("circle")
        .on("mouseover", (data) => {
          toolTip.show(data, this);
        })
        .on("mouseout", (data) => {
          toolTip.hide(data);
        })
        .attr("cx", function (d) {
          if (projection([d.lng, d.lat])) return projection([d.lng, d.lat])[0];
        })
        .attr("cy", function (d) {
          if (projection([d.lng, d.lat])) return projection([d.lng, d.lat])[1];
        })
        //return (d.duration<1) ? 1 : (d.duration*0.001)
        .attr("r", 1)
        .attr("fill", "purple")
        .attr("fill-opacity", 0.8)
        .attr("stroke", "purple")
        .attr("stroke-opacity", 0.8)
        .transition()
        .ease("linear")
        .duration(1000)
        .attr("r", (d) => {
          console.log("##-----------------------------##");
          console.log("duration: " + d.duration + " seconds");
          console.log("r = " + d.duration / 60 * 0.2 + " seconds");
          return (d.duration>21600) ? 21600 : (d.duration / 60 * 0.2)+1;
        })
        .attr("fill", "purple")
        .attr("fill-opacity", 0.2)
        .attr("stroke", "purple")
        .attr("stroke-opacity", 0.2);
      //.text(d => d.duration*0.0001);
  console.log(circles)
  return circles;
}