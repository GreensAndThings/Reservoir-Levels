import { onRegionChange } from "./state.js";

const svg = d3.select("#lines")
  .append("svg")
  .attr("width", 500)
  .attr("height", 250);

d3.json("data/historical_levels.json").then(data => {
  const parseDate = d3.timeParse("%Y-%m");

  data.forEach(d => d.date = parseDate(d.date));

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([50, 480]);

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([200, 20]);

  svg.append("g")
    .attr("transform", "translate(0,200)")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", "translate(50,0)")
    .call(d3.axisLeft(y));

  // Group data by region
  const regions = d3.group(data, d => d.region_id);

  // Draw a line for each region
  regions.forEach((values, key) => {
    svg.append("path")
      .datum(values)
      .attr("class", `line line-${key}`)
      .attr("fill", "none")
      .attr("stroke", "#3498db")       // default blue color
      .attr("stroke-width", 2)
      .attr("opacity", 1)              // fully visible
      .attr("d", d3.line()
        .x(d => x(d.date))
        .y(d => y(d.capacity_pct))
      );
  });

  // Highlight logic: dim other lines when one is selected
  onRegionChange(regionId => {
    svg.selectAll(".line")
      .attr("opacity", d => d[0]?.region_id === regionId ? 1 : 0.2);
  });
});
