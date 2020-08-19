// Use D3 fetch to read the JSON file
// The data from the JSON file is arbitrarily named importedData as the argument
d3.json("data/data.json").then((importedData) => {
  // console.log(importedData);
  var data = importedData;

  // Sort the data array 
  data.sort(function(a, b) {
    return parseFloat(b.greekSearchResults) - parseFloat(a.greekSearchResults);
  });

  // Slice the first 10 objects for plotting
  data = data.slice(0, 10);

  // Reverse the array due to Plotly's defaults
  data = data.reverse();

  // Trace1 for the 
  var trace1 = {
    x: data.map(row => row.durationseconds),
    y: data.map(row => row.state),
    text: data.map(row => row.state),
    name: "UFO",
    type: "bar",
    orientation: "h"
  };

  // data
  var chartData = [trace1];

  // Apply the group bar mode to the layout
  var layout = {
    title: "Significant Encounters & Abductions by State",
    margin: {
      l: 100,
      r: 100,
      t: 100,
      b: 100
    }
  };

  // Render the plot to the div tag with id "plot"
  Plotly.newPlot("plot", chartData, layout);
});
