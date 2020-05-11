// "Global state" av våran data.
let colorCounts = {
  red: [],
  green: [],
  blue: []
}

const processData = async (dataArray) => {
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
  const width = 900;
  const height = 400;

  const yScale = d3.scaleLinear()
    .domain([0,
      d3.max([
        d3.max(colorCounts.red.map((v) => { return v.count })),
        d3.max(colorCounts.green.map((v) => { return v.count })),
        d3.max(colorCounts.blue.map((v) => { return v.count }))
      ])
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
    .attr("d", path(colorCounts.red));
  canvas.append("path")
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("d", path(colorCounts.green));
  canvas.append("path")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("d", path(colorCounts.blue));

  //console.log("NYCKLAR", Object.keys(colors.r));
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