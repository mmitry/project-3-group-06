// Function to create the map dynamically
function createMap(selectedYear) {
  // Delete and recreate map container to refresh the map
  let map_container = d3.select("#map_container");
  map_container.html(""); 
  map_container.append("div").attr("id", "map"); 

  // Step 1: CREATE BASE LAYERS
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Assemble the API query URL
  let url = `/api/v1.0/map_data`;
  console.log(`Fetching data from: ${url}`);

  d3.json(url).then(function (data) {
    console.log("Fetched Data:", data);

    // Filter data by year
    let filteredData = data.filter(row => row.year == selectedYear);

    // Sort home run totals from lowest to highest
    filteredData.sort((a, b) => a.total_home_runs - b.total_home_runs);

    // Get min/max HR counts for color and scale
    let minHR = filteredData[0].total_home_runs;
    let maxHR = filteredData[filteredData.length - 1].total_home_runs;

    // Color scale
    let colorScale = d3.scaleSequential()
      .domain([minHR, maxHR])
      .interpolator(d3.interpolateRdYlGn);

    // Initialize layer groups
    let heatArray = [];
    let markersLayer = L.layerGroup(); // Replaces clustered markers

    // Loop through data and create markers
    filteredData.forEach(row => {
      if (row.latitude && row.longitude && row.total_home_runs) {
        // Assign color and size
        let teamColor = colorScale(row.total_home_runs);
        let markerSize = getMarkerSize(row.total_home_runs);

        let marker = L.circleMarker([row.latitude, row.longitude], {
          radius: markerSize,
          fillColor: teamColor,
          color: "white",
          weight: 0.75,
          fillOpacity: 0.75
        }).bindPopup(
          `<h3>${row.team_abv}</h3><hr>
           <p>Total Home Runs: ${row.total_home_runs}</p>`
        );

        markersLayer.addLayer(marker);

        // Weighted heatmap
        heatArray.push([row.latitude, row.longitude, row.total_home_runs]);
      }
    });

    // Step 3: CREATE LAYER CONTROL
    let baseMaps = {
      "Street View": street,
      "Topographic View": topo
    };

    let overlayMaps = {
      "Team Locations": markersLayer
    };

    // Step 4: INITIALIZE MAP
    let myMap = L.map("map", {
      center: [39.82, -98.58], // Centered over U.S.
      zoom: 4,
      layers: [street, markersLayer] // Add markers directly
    });

    // Step 5: Add Layer Control
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
  });
}

// Function to determine marker size
function getMarkerSize(totalHR) {
  return Math.sqrt(totalHR) * 2; // Scale square root for balanced size
}

// Initialize map with default year
function init() {
  createMap("2019");
}

// Event Listener for dropdown selection
d3.select("#year-dropdown").on("change", function () {
  let selectedYear = d3.select("#year-dropdown").property("value");
  createMap(selectedYear);
});

// On page load
init();