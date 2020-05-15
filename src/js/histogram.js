// "Global state" av våran data.
let colorCounts = {
  red: [],
  green: [],
  blue: []
}
const barRenderCounts = {
  red: [],
  green: [],
  blue: []
}

// För resize eventlistner
let hasBeenDrawn = false;

const testArray = new Array(254);
console.log("length: ", testArray);
for (let i = 3; i < 12; i++) {
  testArray[i] = 80 - i;
}
testArray[300] = 9000;
console.log("slice ", testArray.slice(0, 20));

console.log("max: ", d3.max(testArray.slice(0, 400)));





const processData = (dataArray) => {
  const barWidth = 5;
  const temporaryCounts = {
    r: {},
    g: {},
    b: {},
  }
  const barColorCounts = {
    red: new Array(255),
    blue: new Array(255),
    green: new Array(255),
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
    colorCounts.red.push({ "intensity": key, "count": temporaryCounts.r[key] });
    barColorCounts.red[key] = temporaryCounts.r[key];
  }
  for (const key in temporaryCounts.g) {
    colorCounts.green.push({ "intensity": key, "count": temporaryCounts.g[key] })
    barColorCounts.green[key] = temporaryCounts.g[key];
  }
  for (const key in temporaryCounts.b) {
    colorCounts.blue.push({ "intensity": key, "count": temporaryCounts.b[key] })
    barColorCounts.blue[key] = temporaryCounts.b[key];
  }
  console.log("colorcountsbar: ", barColorCounts);

 

  for (let i = 0; i < 255; i += barWidth) {
    barRenderCounts.red.push(d3.max(barColorCounts.red.slice(i, i+barWidth-1)));
    //barRenderCounts.green.push(d3.max(barColorCounts.green.slice(i, i+barWidth-1)));
    //barRenderCounts.blue.push(d3.max(barColorCounts.green.slice(i, i+barWidth-1)));
  }
  


}


const drawChart = () => {
  const width = window.innerWidth / 2;
  const height = window.innerHeight / 2;
  const stroke_width = 2;
  const fill_opacity = 1 / 2;
  const margin = { left: width / 4, right: width / 4, top: height / 4, bottom: height / 4 }

  // Ta reda på största antalet från red/green/blue
  const maxIntensity = d3.max([
    d3.max(colorCounts.red.map((v) => { return v.count })),
    d3.max(colorCounts.green.map((v) => { return v.count })),
    d3.max(colorCounts.blue.map((v) => { return v.count }))
  ]);

  // Barchart variabler
  const yScaleBarchart = d3.scaleLinear()
    .domain([0, maxIntensity])
    .range([0, height]);
  const barWidth = 5;

  // Gör scalorna
  const yScale = d3.scaleLinear()
    .domain([0, maxIntensity])
    .range([height, 0]);

  const xScale = d3.scaleLinear()
    .domain([0, 255])
    .range([0, width]);
  // Gör axlarna
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

  //Tömmer svg för resize och image loading
  d3.select("svg").remove();

  // Gör ritområdet med margins
  const canvas = d3.select("#lines")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // d3.area() istället för line så vi kan fylla den fint
  const area = d3.area()
    .x((data, i) => { return xScale(data.intensity) })
    .y1((data, i) => yScale(data.count))
    .y0(yScale(0));

  // Gör en grupp för färgerna
  const histogramGroup = canvas.append("g").attr("class", "RGB");
  // Mouseover event listeners för grafen
  histogramGroup
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);
  // Mouseover event listeners för området utanför grafen
  histogramGroup
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);
  // rita en linje
  histogramGroup.append("path")
    .attr("stroke", "red")
    .attr("fill", "red")
    .attr("d", area(colorCounts.red));
  // rektangel
  console.log("barrender", barRenderCounts);
  histogramGroup.append("g")
    .attr("class", "redgroup")
    .selectAll("röda")
    .data(barRenderCounts.red)
    .enter()
    .append("rect")
    .attr("fill", "red")
    .attr("width", xScale(barWidth))
    .attr("x", (data, i) => { return xScale(i * barWidth) })
    .attr("height", (data) => { console.log("gör något"); return yScaleBarchart(data.count) })
    .attr("y", (data) => { return height - yScaleBarchart(data.count) })

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
  canvas.append("g")
    .attr("class", "axis y")
    .call(yAxis);

  canvas.append("g")
    .attr("class", "axis x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  // axis labels
  const labels = canvas.append("g").attr("class", "labels");
  labels.append("text")
    .attr("transform",
      "translate(" + (width / 2) + " ," +
      (height + margin.bottom / 2) + ")")
    .attr("font-family", "sans-serif")
    .attr("font-size", "20")
    .style("text-anchor", "middle")
    .text("Color Value");

  labels.append("text")
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
  let focusGroup = canvas.append("g").attr("class", "focus");
  let focusTextGroup = canvas.append("g").attr("class", "focusText");
  let focus = {};
  let focusText = {};
  addFocusAndFocusTextGroups("red");
  addFocusAndFocusTextGroups("green");
  addFocusAndFocusTextGroups("blue");


  function addFocusAndFocusTextGroups(color) {
    focus[color] = focusGroup
      .append('g')
      .style("pointer-events", "none")
      .append('circle')
      .style("fill", color)
      .attr("stroke", "black")
      .attr('r', 7.5)
      .style("opacity", 0);
    focusText[color] = focusTextGroup
      .append('g')
      .append('text')
      .style("opacity", 0)
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")
  }

  function mouseover() {
    changeMouseOverOpacity("red", 1);
    changeMouseOverOpacity("green", 1);
    changeMouseOverOpacity("blue", 1);
  }

  function mousemove() {
    // recover coordinate we need
    const x0 = xScale.invert(d3.mouse(this)[0]);

    updateMouseOverData("red", x0);
    updateMouseOverData("green", x0);
    updateMouseOverData("blue", x0);

  }

  function mouseout() {
    changeMouseOverOpacity("red", 0);
    changeMouseOverOpacity("green", 0);
    changeMouseOverOpacity("blue", 0);
  }

  function updateMouseOverData(color, x0) {
    const i = bisect(colorCounts[color], x0, 1);
    const selectedData = colorCounts[color][i];
    focus[color]
      .attr("cx", xScale(selectedData.intensity))
      .attr("cy", yScale(selectedData.count));

    focusText[color]
      .html("x: " + selectedData.intensity + " y: " + selectedData.count)
      .attr("x", xScale(selectedData.intensity) + 15)
      .attr("y", yScale(selectedData.count));
  }

  function changeMouseOverOpacity(color, opacity) {
    focus[color].style("opacity", opacity);
    focusText[color].style("opacity", opacity);
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