const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

fetch(url)
.then(response => response.json())
.then(data => {
  makeChart(data.data);
});

function makeChart(dataset) {
  const w = 900;
  const h = 450;
  const padding = 40;
   
  // THE SCALES
  const years = dataset.map(item => new Date(item[0]));
  /*This next part where the month is set I took from the fCC example (https://codepen.io/freeCodeCamp/full/GrZVaM) and do not fully understand why it only works this way. My best guess: the Date object months are reffered by their index, and since JS is 0 index based, they're all off by 1 when compared to the months from the raw data (January===01===0, February===02===1 etc). So, if you want the last date in the dataset to be taken into consideration you have to set the month index to be >= to the number of the month as we know it.*/
  const xMax = new Date(d3.max(years));
  xMax.setMonth(xMax.getMonth() + 1);
  const xAxisScale = d3.scaleTime()
                       .domain([d3.min(years), xMax])
                       .range([padding, w - padding]);
  //This is the reversed y scale, the one that goes from max to min, need so the left axis displays data bottom to top.
  const yAxisScale = d3.scaleLinear()
                   .domain([0, d3.max(dataset, d => d[1])])
                   .range([h - padding, padding]);
  //This is the y axis that goes from min to max, needed so the bars are displayed left to right.
  const yScale = d3.scaleLinear()
                   .domain([0, d3.max(dataset, d => d[1])])
                   .range([padding, h - padding]);
  
  //THE SVG
  const svg = d3.select("#container")
                .append("svg")
                .attr("width", w)
                .attr("height", h);
  
  //THE AXES
  const xAxis = d3.axisBottom().scale(xAxisScale);
  const yAxis = d3.axisLeft(yAxisScale); 
  svg.append("g")
     .attr("transform", `translate(0, ${h - padding})`)
     .attr("id", "x-axis")
     .call(xAxis);
  
  svg.append("g")
     .attr("transform", `translate(${padding}, 0)`)
     .attr("id", "y-axis")
     .call(yAxis);
  
//THE BARS
  //There's padding on both sides!
  const totalBarSpace = (w - padding * 2) / dataset.length;
  //Bars take 90% of the space between each x point, so that there is a 10% wide gap separating them.
  const barW = totalBarSpace * 0.9;
  
  const bar = svg.selectAll("rect")
     .data(dataset)
     .enter()
     .append("rect")
     .attr("x", (d, i) => padding + (i * totalBarSpace))
     .attr("y", (d, i) => h - yScale(d[1]))
     .attr("width", barW)
     .attr("height", (d, i) => yScale(d[1]) - padding)
     .attr("fill", "rgb(19, 90, 145)")
     .attr("class", "bar")
     .attr("data-date", (d, i) => d[0])
     .attr("data-gdp", (d, i) => d[1]);
  
  //THE TOOLTIPS
  bar
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);
  //The tooltip is only created. Everything else is set from the event handlers, except y coordinate which is fixed in the .css file.
  const tooltip = d3.select("#container")
     .append("div")
     .attr("id", "tooltip");  
         
  function handleMouseOver (evt, d)  { 
    const quarter = {
      "01": "Q1",
      "04": "Q2",
      "07": "Q3",
      "10": "Q4"
    };
    const dateArr = d[0].split("-");
    const year = dateArr[0];
    const month = dateArr[1];
    const i = dataset.indexOf(d);
    //The data-date attribute is set to the full date. 
    //HTML is set to display YYYY QX /n &XXX Billion. 
    //The tooltip is pulled to the pointer x location 
    //and it's set to be visible.   
    tooltip
      .attr("data-date", d[0])
      .html(`<p>${year} ${quarter[month]}</p><p>$${d[1]} Billion</p>`)
      .style("left", `${evt.pageX}px`)
      .style("visibility", "visible");
  }
  
  function handleMouseOut() {
    tooltip
      .style("visibility", "hidden");
  }
}