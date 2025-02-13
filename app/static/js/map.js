// Function to create the map dynamically
function createMap(selectedYear, selectedStat) {
  // Delete Map
  let map_container = d3.select("#map_container");
  map_container.html(""); // empties it
  map_container.append("div").attr("id", "map");

  // Assemble the API query URL.
  let url = `/api/v1.0/map_data?year=${selectedYear}&stat=${selectedStat}`;
  console.log(url);

  d3.json(url).then(function (data) {
    console.log(data);

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
      zoom: 5,
      layers: [L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')]
    });

    // Add markers to the map
    L.layerGroup(markers).addTo(myMap);
  });
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