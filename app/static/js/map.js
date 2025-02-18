// Function to create the map dynamically
function createMap(selectedYear, selectedStat) {
  
  // Delete Map
  let map_container = d3.select("#map_container");
  map_container.html("");
  map_container.append("div").attr("id", "map").style("height", "800px");

  // Step 1: CREATE THE BASE LAYERS
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Assemble the API query URL.
  let url = `/api/v1.0/map_data?year=${selectedYear}&stat=${selectedStat}`;
  console.log(`Fetching map data from: ${url}`);

  d3.json(url).then(function (data) {
    console.log("Map Data Received:", data);

    // Initialize data containers
    let markers = [];

    // Determine min/max for scaling
    let minStat = Math.min(...data.map(d => d.total_stat));
    let maxStat = Math.max(...data.map(d => d.total_stat));

    // Function to scale marker
    function getRadius(stat) {
      return 10 + ((stat - minStat) / (maxStat - minStat)) * 40;
    }

    // Function to determine color
    function chooseColor(stat) {
      let scale = (stat - minStat) / (maxStat - minStat);
      let red = Math.round(255 * (1 - scale));
      let green = Math.round(255 * scale);
      return `rgb(${red}, ${green}, 0)`;
    }

    // Loop through data
    for (let i = 0; i < data.length; i++) {
      let row = data[i];

      if (row.latitude && row.longitude) {
        let marker = L.circleMarker([row.latitude, row.longitude], {
          fillOpacity: 0.75,
          color: "white",
          weight: 0.75,
          fillColor: chooseColor(row.total_stat),
          radius: getRadius(row.total_stat)
        }).bindPopup(
          `<h3>${row.team} (${row.team_abv})</h3><hr>
           <p>${selectedStat}: ${row.total_stat}</p>`
        );

        markers.push(marker);
      }
    }

    // Initialize map
    let myMap = L.map("map", {
      center: [36.82, -98.58], // U.S. center
      zoom: 4.5,
      layers: [street]
    });

    // Add marker layer if there are markers
    let markerLayer = L.layerGroup(markers);
    if (markers.length > 0) {
      markerLayer.addTo(myMap);
    } else {
      console.warn("No markers to add to the map.");
    }

    // Layer Control
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };

    let overlayMaps = {
      "Team Stats": markerLayer
    };

    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

  }).catch(error => console.error("Error fetching map data:", error));
}

// Initialize map with default values
function init() {
  let selectedYear = d3.select("#year-dropdown").property("value");
  let selectedStat = d3.select('input[name="stat-option"]:checked').property("value");
  createMap(selectedYear, selectedStat);
}

// Event Listeners
d3.select("#year-dropdown").on("change", init);
d3.selectAll('input[name="stat-option"]').on("change", init);

// On page load
init();