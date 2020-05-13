// "Global state" av våran data.
let colorCounts = {
  red: [],
  green: [],
  blue: []
}
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
    let colorVal = temporaryCounts.r[dataArray[i]]; // colorVal blir antingen mängden occurences, eller undefined
    temporaryCounts.r[dataArray[i]] = colorVal ? colorVal + 1 : 1;

    colorVal = temporaryCounts.g[dataArray[i + 1]];
    temporaryCounts.g[dataArray[i + 1]] = colorVal ? colorVal + 1 : 1;

    colorVal = temporaryCounts.b[dataArray[i + 2]];
    temporaryCounts.b[dataArray[i + 2]] = colorVal ? colorVal + 1 : 1;
  }


  /*
  * Konverterar counts till en array av object
  */
  // Töm colorCounts från sin state först
  colorCounts = {
    red: [],
    green: [],
    blue: []
  }
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
  const margin = {left:width/4, right:width/4, top:height/4, bottom:height/4}

  const yScale = d3.scaleLinear()
    .domain([0,
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

  let yAxis = d3.axisLeft(yScale)
                .ticks(5)
                .tickPadding(15)
                .tickSize(10);
  let xAxis = d3.axisBottom(xScale)
                .ticks(6)
                .tickValues([0,50,100,150,200,255])
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
                    .attr("width", width+margin.left+margin.right)
                    .attr("height", height+margin.top+margin.bottom);

  // d3.line() är en egenerator som genererar en sträng för d="M x y ..."
  const area = d3.area()
    .x((data, i) => { return xScale(data.intensity) })
    .y1((data, i) => yScale(data.count))
    .y0(yScale(0));
  //.curve(d3.curveCardinal);

  // Gör en grupp som vi kan flytta runt på
  const histogramGroup = canvas.append("g")
                              .attr("transform","translate("+margin.left+","+margin.top+")");
  // rita en linje
  histogramGroup.append("path")
                .attr("stroke", "red")
                .attr("d", area(colorCounts.red));
  histogramGroup.append("path")
                .attr("stroke", "green")
                .attr("d", area(colorCounts.green));
  histogramGroup.append("path")
                .attr("stroke", "blue")
                .attr("d", area(colorCounts.blue));
  // level 1 style
  histogramGroup.selectAll("path")
                .attr("stroke-width",2)
                .attr("fill","none");


                // Prova med en fill men den går inte i botten
                // function(){this.style.fill = window.getComputedStyle(this).getPropertyValue("stroke");}
  histogramGroup.selectAll("path").on("mousemove", function(){this.style.fill = window.getComputedStyle(this).getPropertyValue("stroke");d3.select(this).raise();})
                                  .on("mouseout", function(){this.style.fill = "none"});
  histogramGroup.append("text")             
  .attr("transform",
        "translate(" + (width/2) + " ," + 
                       (height+margin.bottom/2) + ")")
  .style("text-anchor", "middle")
  .text("Color Value");

  histogramGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left / 2)
  .attr("x",0 - (height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Intensity");      


  // rita axises
  histogramGroup.append("g")
        .attr("class","axis y")
        .call(yAxis);

  histogramGroup.append("g")
                .attr("class","axis x")
                .attr("transform","translate(0,"+height+")")
                .call(xAxis);
  
  // Bilden har garanterat blivit ritad då man ändrar boolean i slutet av funktionen
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