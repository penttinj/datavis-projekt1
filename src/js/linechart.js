const drawChart = async (datan) => {
  const dataArray = datan;
  console.log("dataarray", dataArray.length);
  const colorCounts = {
    r: {},
    g: {},
    b: {},
  }
  // Räknar occurences av varje color värde
  for (let i = 0; i < dataArray.length; i += 4) {
    //colors.r.push(dataArray[i]);
    let colorVal = colorCounts.r[dataArray[i]];
    colorCounts.r[dataArray[i]] = colorVal ? colorVal + 1 : 1;

    colorVal = colorCounts.g[dataArray[i+1]];
    colorCounts.g[dataArray[i+1]] = colorVal ? colorVal + 1 : 1;

    colorVal = colorCounts.b[dataArray[i+2]];
    colorCounts.b[dataArray[i+2]] = colorVal ? colorVal + 1 : 1;
  }

  console.log("colorCounts", colorCounts);

  /*
  * Konverterar objectet till en array av object
  */
  let colorCountsObj = {
    red: [],
    green: [],
    blue: []
  }
  for (const key in colorCounts.r) {
    colorCountsObj.red.push(
      { "intensity": key, "count": colorCounts.r[key] }
    )
  }
  for (const key in colorCounts.g) {
    colorCountsObj.green.push(
      { "intensity": key, "count": colorCounts.g[key] }
    )
  }
  for (const key in colorCounts.b) {
    colorCountsObj.blue.push(
      { "intensity": key, "count": colorCounts.b[key] }
    )
  }



  const width = 900;
  const height = 400;
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(
      //blues.map(function(val) { return val.value; })),
      [
        d3.max(colorCountsObj.red.map((v) => { return v.count })),
        d3.max(colorCountsObj.green.map((v) => { return v.count })),
        d3.max(colorCountsObj.blue.map((v) => { return v.count }))
      ]
    )
    ])


    .range([height, 0]);

  d3.select("svg").remove();
  const canvas = d3.select("#lines").append("svg").attr("width", width).attr("height", height);

  // d3.line() är en egenerator som genererar en sträng för d="M x y ..."
  const path = d3.line()
    .x((data, i) => { return data.intensity * 3 })
    .y((data, i) => yScale(data.count))
  //.curve(d3.curveCardinal);

  // rita en linje
  canvas.append("path")
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("d", path(colorCountsObj.red));
  canvas.append("path")
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("d", path(colorCountsObj.green));
  canvas.append("path")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("d", path(colorCountsObj.blue));

  //console.log("NYCKLAR", Object.keys(colors.r));
}


// Read external JSON data with promise-structure
async function readJson() {
  return d3.json("/data/img.json").then((data) => {
    return data;
  })
}

const analyze = (img) => {
  //const img = document.querySelector("#bilden");

  console.log("Image has loaded");

  const canvas = document.querySelector("#canvas");
  const context = canvas.getContext("2d");
  console.log("before:", img.height, img.width);
  canvas.height = img.height;
  canvas.width = img.width;
  //console.log("after:", canvas.height, canvas.width);
  context.drawImage(img, 0, 0);
  const imageData = context.getImageData(0, 0, img.width, img.height);
  //console.log("imageData");
  let arr = [];
  imageData.data.forEach(element => {
    arr.push(element);
  });
  drawChart(arr);

}

const readImage = (input) => {
  if (input.target.files && input.target.files[0]) {
    let img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      //const imgElement = document.querySelector("#bilden");
      //imgElement.src = e.target.result;
      img.src = e.target.result;
      img.onload = () => analyze(img); // Waits until the img element has completely loaded so we can access its properties
    }

    reader.readAsDataURL(input.target.files[0]);
  }
}












document.querySelector("#input").addEventListener("change", readImage);
//window.onload = drawChart();