// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
  data.forEach(function(d) {d.Likes = +d.Likes;});

    // Define the dimensions and margins for the SVG
  const margin = { top: 30, right: 180, bottom: 70, left: 70 };
  const width  = 900 - margin.left - margin.right;
  const height = 420 - margin.top - margin.bottom;

    // Create the SVG container
  const svg = d3.select("#boxplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
    

    // Set up scales for x and y axes

  const x = d3.scaleBand()
    .domain([...new Set(data.map(d => d.AgeGroup))])
    .range([0, width])
    .padding(0.2);

    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
  const y = d3.scaleLinear()
    .domain([0, 1000])
    .range([height, 0]);

    // d3.min(data, d => d.Likes) to achieve the min value and 
  
  const likesMin = d3.min(data, d => d.Likes);

    // d3.max(data, d => d.Likes) to achieve the max value

  const likesMax = d3.max(data, d => d.Likes);

    // For the domain of the xscale, you can list all three age groups or use
    // [...new Set(data.map(d => d.AgeGroup))] to achieve a unique list of the age group
    // Add scales   
    
  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(xAxis);
  svg.append("g")
  .call(yAxis);

    // Add x-axis label
    
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 30) 
    .attr("text-anchor", "middle")
    .text("Age Group");

    // Add y-axis label

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -45)       
    .attr("text-anchor", "middle")
    .text("Number of Likes");
    

  const rollupFunction = function(groupData) {
    const values = groupData.map(d => d.Likes).sort(d3.ascending);
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const min = d3.min(values);
    const max = d3.max(values);
    return { min, q1, median, q3, max };
  };

  const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

  quantilesByGroups.forEach((q, AgeGroup) => {
    const cx = x(AgeGroup) + x.bandwidth() / 2;
    const bw = x.bandwidth() * 0.6;

      // Vertical line (min → max)
    svg.append("line")
      .attr("x1", cx).attr("x2", cx)
      .attr("y1", y(q.min)).attr("y2", y(q.max))
      .attr("stroke", "black");

      // Box (Q1 → Q3)
    svg.append("rect")
      .attr("x", cx - bw/2)
      .attr("y", y(q.q3))
      .attr("width", bw)
      .attr("height", y(q.q1) - y(q.q3))
      .attr("fill", "#2b4e7bff")
      .attr("stroke", "black");

      // Median line
    svg.append("line")
      .attr("x1", cx - bw/2).attr("x2", cx + bw/2)
      .attr("y1", y(q.median)).attr("y2", y(q.median))
      .attr("stroke", "black").attr("stroke-width", 2);
  });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(data => {
  // Coerce number
  data.forEach(d => d.AvgLikes = +d.AvgLikes);


    // Define the dimensions and margins for the SVG
  const margin = { top: 20, right: 180, bottom: 60, left: 60 };
  const width  = 900 - margin.left - margin.right;
  const height = 420 - margin.top - margin.bottom;


    // Create the SVG container
  const svg = d3.select("#barplot")
    .append("svg")
    .attr("width",  width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define four scales
    const platforms = [...new Set(data.map(d => d.Platform))];

  const x0 = d3.scaleBand()
    .domain(platforms)
    .range([0, width])
    .paddingInner(0.2);


  const postTypes = [...new Set(data.map(d => d.PostType))];
  const x1 = d3.scaleBand()
    .domain(postTypes)
    .range([0, x0.bandwidth()])
    .padding(0.15);
  
  const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => +d.AvgLikes)])  // force numeric
  .nice()
  .range([height, 0]);

    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const color = d3.scaleOrdinal()
      .domain(postTypes)
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add scales x0 and y  
    
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0));

    svg.append("g").call(d3.axisLeft(y));
      

    // Add x-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .text("Platform");

    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)          
      .attr("text-anchor", "middle")
      .text("Average Likes");

  // Group container for bars
    const eachbar = svg.selectAll(".g-platform")
    .data(platforms)
    .join("g")
    .attr("class", "g-platform")
    .attr("transform", p => `translate(${x0(p)},0)`);


  // Draw bars
    eachbar.selectAll("rect")
    .data(p => data.filter(d => d.Platform === p))
    .join("rect")
    .attr("x", d => x1(d.PostType))
    .attr("y", d => y(d.AvgLikes))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y(d.AvgLikes))
    .attr("fill", d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, 0)`);

    const types = [...new Set(data.map(d => d.PostType))];
 

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
    types.forEach((type, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(type));

    legend.append("text")
      .attr("x", 20)
      .attr("y", i * 22 + 11)
      .attr("alignment-baseline", "middle")
      .style("font-size", "12px")
      .text(type);
  });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(data => {
  const parse = d3.timeParse("%-m/%-d/%Y (%A)"); // on Windows: "%m/%d/%Y (%A)"
  data = data.map(d => ({ Date: parse(d.Date), AvgLikes: +d.AvgLikes }));

    // Define the dimensions and margins for the SVG
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const width  = 800 - margin.left - margin.right;
    const height = 380 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#lineplot")
      .append("svg")
      .attr("width",  width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    

    // Set up scales for x and y axes 

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.Date))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.AvgLikes)])
    .nice()
    .range([height, 0]);


    // Draw the axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(data.length))
    .selectAll("text")
    .attr("transform", "rotate(-35)")
    .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(y));

    // Add x-axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("Date");


    // Add y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -45)
    .attr("text-anchor", "middle")
    .text("Average Likes");


    // Draw the line and path. Remember to use curveNatural. 
  const line = d3.line()
    .x(d => x(d.Date))
    .y(d => y(d.AvgLikes))
    .curve(d3.curveNatural);

  svg.append("path")
    .datum(data.sort((a, b) => a.Date - b.Date))
    .attr("fill", "none")
    .attr("stroke", "#1f77b4")
    .attr("stroke-width", 2)
    .attr("d", line);
});

