import { setRegion, onRegionChange } from "./state.js";

const svg = d3.select("#bars")
  .append("svg")
  .attr("width", 400)
  .attr("height", 250);

d3.json("data/current_levels.json").then(data => {
  const x = d3.scaleBand()
    .domain(data.map(d => d.region_name))
    .range([50, 380])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([200, 20]);

  svg.append("g")
    .attr("transform", "translate(0,200)")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", "translate(50,0)")
    .call(d3.axisLeft(y));

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.region_name))
    .attr("y", d => y(d.capacity_pct))
    .attr("height", d => 200 - y(d.capacity_pct))
    .attr("width", x.bandwidth())
    .attr("class", d => `bar bar-${d.region_id}`)
    .on("mouseover click", (event, d) => {
      setRegion(d.region_id);
    });

  onRegionChange(regionId => {
    svg.selectAll(".bar")
      .classed("highlight", d => d.region_id === regionId);
  });
});
