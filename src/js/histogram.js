// "Global state" av våran data.
let colorCounts = {
  red: [],
  green: [],
  blue: []
}
// För resize eventlistner
let hasBeenDrawn = false;

const processData = (dataArray) => {
  console.log("dataarray", dataArray.length);
  const temporaryCounts = {
    r: {},
    g: {},
    b: {},
  }
  // Räknar occurences av varje color värde
  for (let i = 0; i < dataArray.length; i += 4) {
    // colorVal blir antingen antalet av den färgen, eller undefined om färgen inte fanns i objektet än
    let colorVal = temporaryCounts.r[dataArray[i]];
    temporaryCounts.r[dataArray[i]] = colorVal ? colorVal + 1 : 1;

    colorVal = temporaryCounts.g[dataArray[i + 1]];
    temporaryCounts.g[dataArray[i + 1]] = colorVal ? colorVal + 1 : 1;

    colorVal = temporaryCounts.b[dataArray[i + 2]];
    temporaryCounts.b[dataArray[i + 2]] = colorVal ? colorVal + 1 : 1;
  }


  // Töm colorCounts först
  colorCounts = {
    red: [],
    green: [],
    blue: []
  }
  // Konverterar datan från temporaryCounts till en array av object
  for (const key in temporaryCounts.r) {
    colorCounts.red.push(
      { "intensity": key, "count": temporaryCounts.r[key] }
    )
  }
  for (const key in temporaryCounts.g) {
    colorCounts.green.push(
      { "intensity": key, "count": temporaryCounts.g[key] }
    )
  }
  for (const key in temporaryCounts.b) {
    colorCounts.blue.push(
      { "intensity": key, "count": temporaryCounts.b[key] }
    )
  }
  console.log("colorcounts: ", colorCounts);
}


const drawChart = () => {
  const width = window.innerWidth / 2;
  const height = window.innerHeight / 2;
  const stroke_width = 2;
  const fill_opacity = 1 / 2;
  const margin = { left: width / 4, right: width / 4, top: height / 4, bottom: height / 4 }


  const yScale = d3.scaleLinear()
    .domain([0,
      // Ta reda på största antalet från red/green/blue
      d3.max([
        d3.max(colorCounts.red.map((v) => { return v.count })),
        d3.max(colorCounts.green.map((v) => { return v.count })),
        d3.max(colorCounts.blue.map((v) => { return v.count }))
      ])
    ])
    .range([height, 0]);

  const xScale = d3.scaleLinear()
    .domain([0, 255])
    .range([0, width]);

  const yAxis = d3.axisLeft(yScale)
    .ticks(5)
    .tickPadding(15)
    .tickSize(10);
  // Egna xAxis värden så det slutar på 255 eftersom vi talar färger
  const xAxis = d3.axisBottom(xScale)
    .ticks(6)
    .tickValues([0, 50, 100, 150, 200, 255])
    .tickPadding(15)
    .tickSize(10);

  console.log("d3max:");
  console.log(d3.max([
    d3.max(colorCounts.red.map((v) => { return v.count })),
    d3.max(colorCounts.green.map((v) => { return v.count })),
    d3.max(colorCounts.blue.map((v) => { return v.count }))
  ]));

  d3.select("svg").remove();


  // Gör ritområdet med margins
  const canvas = d3.select("#lines")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // d3.area() istället för line så vi kan fylla den fint
  const area = d3.area()
    .x((data, i) => { return xScale(data.intensity) })
    .y1((data, i) => yScale(data.count))
    .y0(yScale(0));

  // Gör en grupp som vi kan flytta runt på
  const histogramGroup = canvas.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // rita en linje
  histogramGroup.append("path")
    .attr("stroke", "red")
    .attr("fill", "red")
    .attr("d", area(colorCounts.red));
  histogramGroup.append("path")
    .attr("stroke", "green")
    .attr("fill", "green")
    .attr("d", area(colorCounts.green));
  histogramGroup.append("path")
    .attr("stroke", "blue")
    .attr("fill", "blue")
    .attr("d", area(colorCounts.blue));
  // stroke-width och opacity av paths
  histogramGroup.selectAll("path")
    .attr("stroke-width", stroke_width)
    .attr("opacity", fill_opacity);
  // mouseover fill
  histogramGroup.selectAll("path")
    .on("mousemove", function () { this.style.opacity = 1.0; d3.select(this).raise(); })
    .on("mouseout", function () { this.style.opacity = fill_opacity });
  // rita axises
  histogramGroup.append("g")
    .attr("class", "axis y")
    .call(yAxis);

  histogramGroup.append("g")
    .attr("class", "axis x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  // axis labels
  histogramGroup.append("text")
    .attr("transform",
      "translate(" + (width / 2) + " ," +
      (height + margin.bottom / 2) + ")")
    .attr("font-family", "sans-serif")
    .attr("font-size", "20")
    .style("text-anchor", "middle")
    .text("Color Value");

  histogramGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left / 2)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .attr("font-size", "20")
    .style("text-anchor", "middle")
    .text("Intensity");


  // mouseover data tack vare https://www.d3-graph-gallery.com/graph/line_cursor.html
  var bisect = d3.bisector(function (d) { return d.intensity; }).left;
  var focus = histogramGroup
    .append('g')
    .append('circle')
    .style("fill", "none")
    .attr("stroke", "black")
    .attr('r', 8.5)
    .style("opacity", 0)

  var focusText = histogramGroup
    .append('g')
    .append('text')
    .style("opacity", 0)
    .attr("text-anchor", "left")
    .attr("alignment-baseline", "middle");
  // Create a rect on top of the svg area: this rectangle recovers mouse position
  histogramGroup
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

  function mouseover() {
    focus.style("opacity", 1)
    focusText.style("opacity", 1)
  }
  function mousemove() {
    // recover coordinate we need
    let x0 = xScale.invert(d3.mouse(this)[0]);
    console.log("d3mouse: ", d3.mouse(this)[0]);
    console.log("invert: ", xScale.invert(d3.mouse(this)[0]));
    let i = bisect(colorCounts.red, x0, 1);
    selectedData = colorCounts.red[i];
    focus
      .attr("cx", xScale(selectedData.intensity))
      .attr("cy", yScale(selectedData.count))
    focusText
      .html("Röd:" + selectedData.intensity + "  -  " + "Mängd:" + selectedData.count)
      .attr("x", xScale(selectedData.intensity) + 15)
      .attr("y", yScale(selectedData.count))

  }
  function mouseout() {
    focus.style("opacity", 0)
    focusText.style("opacity", 0)
  }


  // Bilden har nu garanterat blivit ritad, så när resize händer får drawChart() kallas igen, och det finns data att rita om svg'n med
  hasBeenDrawn = true;
}

const getImageData = (img) => {
  console.log("Image has loaded");

  const canvas = document.querySelector("#canvas");
  const context = canvas.getContext("2d");
  canvas.height = img.height;
  canvas.width = img.width;
  context.drawImage(img, 0, 0);
  const imageData = context.getImageData(0, 0, img.width, img.height);

  // Push image data to an array
  const dataArray = [];
  imageData.data.forEach(element => {
    dataArray.push(element);
  });

  return dataArray;
}

const handleImage = (input) => {
  if (input.target.files && input.target.files[0]) {
    let img = new Image();
    let data = [];
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      // Waits until the img element has completely loaded so we can access its properties
      img.onload = () => {
        data = getImageData(img);
        processData(data);
        drawChart();
      }
    }

    reader.readAsDataURL(input.target.files[0]);
  }
}


document.querySelector("#input").addEventListener("change", handleImage);
window.addEventListener("resize", (e) => {
  if (hasBeenDrawn) drawChart();
  else console.log("false");
})