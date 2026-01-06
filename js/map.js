import * as d3 from "https://cdn.skypack.dev/d3@7";

const width = 800;
const height = 1000;

// Create an SVG inside the #map div
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Set up a geographic projection
const projection = d3.geoMercator()
//  .scale(4000) // adjust to fit UK map
//  .center([-1.5, 54]) // center on UK [lon, lat]
//  .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Create a tooltip div (hidden by default)
const tooltip = d3.select("#map")
  .append("div")
  .style("position", "absolute")
  .style("background", "white")
  .style("padding", "6px 10px")
  .style("border", "1px solid #333")
  .style("border-radius", "4px")
  .style("pointer-events", "none") // so it doesn't block mouse
  .style("opacity", 0);

// Map company status to colors
const statusColors = {
  "Above Average": "#69b3a2", // green
  "Average": "#fdd835",       // yellow
  "Below Average": "#d32f2f", // red
  "N/A": "#bdbdbd"            // grey
};


// Load both GeoJSON and company status JSON
Promise.all([
  d3.json("data/reversed.geojson"),
  d3.json("data/current_levels.json")
]).then(([geoData, statusData]) => {

  // Create a lookup: company_name -> company_status
  const statusLookup = {};
  statusData.forEach(d => {
    statusLookup[d.region_name] = d.status;
  });

  // Fit projection to the GeoJSON (England + Wales)
  projection.fitSize([width, height], geoData);

  // Draw each feature
  svg.selectAll("path")
    .data(geoData.features)
    .join("path")
    .attr("d", path)
    .attr("fill", d => {
         const status = statusLookup[d.properties.COMPANY] || "N/A";
         return statusColors[status];
    })
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5)
    .on("mouseover", function(event, d) {
      d3.select(this).attr("stroke-width", 2); // highlight
      const company = d.properties.COMPANY;
      const status = statusLookup[company] || "N/A";
      tooltip
        .style("opacity", 1)
        .html(`<strong>${company}</strong><br>Company status: ${status}`);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("stroke-width", 0.5);
      tooltip.style("opacity", 0);
    });

}).catch(error => {
  console.error("Error loading GeoJSON:", error);
});
