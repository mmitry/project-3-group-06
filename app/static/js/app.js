// Use D3 to select the table
let table = d3.select("#mlb_table");
let tbody = table.select("tbody");
let yearDropdown = d3.select("#year-dropdown");

// Make Table Interactive
let dt_table = new DataTable('#mlb_table');

// Event Listener
yearDropdown.on("change", function () {
  let selectedYear = this.value;
  updateChart(selectedYear);
});

// On Page Load
d3.json("/api/v1.0/bar_data").then(function (data) {
  window.allData = data;
  updateChart("2019");    
});

d3.json("/api/v1.0/table_data").then(function (data) {
  makeTable(data);
});

// Helper Functions

function updateChart(year) {
  // Make Request
  let filteredData = window.allData.filter(row => row.year == year);

  // Make Plot
  let trace = {
    x: filteredData.map(row => row.team_abv),
    y: filteredData.map(row => row.total_home_runs),
    type: 'bar',
    marker: {
      color: filteredData.map(row => team_colors[row.team_abv] || "#888888")
    }
  };

  // Data trace
  let traces = [trace];

  // Apply title
  let layout = {
    title: `Number of Home Runs in ${year}`,
    xaxis: { title: "Team" },
    yaxis: { title: "Total Home Runs" },
    height: 500,  // Fixed height
    width: 950,   // Fixed width
    margin: { t: 50, l: 50, r: 50, b: 100 }
  };

  // Render the plot to the div tag with id "plot"
  Plotly.newPlot('plot', traces, layout);
}

// Fetch heatmap data from API and create heatmap
function createHeatmap() {
  d3.json("/api/v1.0/heat_data").then(function (data) {
      let teams = data.map(d => d.team_abv);
      let stats = ['AVG', 'HR', 'R', 'SO'];
      
      let zValues = stats.map(stat => data.map(d => d[stat]));
      
      let trace = {
          z: zValues,
          x: teams,
          y: stats,
          type: 'heatmap',
          colorscale: 'Viridis'
      };
      
      let layout = {
          title: 'MLB Team Statistics Heatmap',
          xaxis: { title: 'Teams' },
          yaxis: { title: 'Statistics' },
          height: 500,  // Fixed height (matches bar chart)
          width: 950,   // Fixed width (matches bar chart)
          margin: { t: 50, l: 100, r: 50, b: 100 }
      };
      
      // Plot the heatmap
      Plotly.newPlot('heatmap', [trace], layout);

      // Add a click event listener to the heatmap
      const heatmapDiv = document.getElementById('heatmap');
      heatmapDiv.on('plotly_click', function(eventData) {
        // Extract the team abbreviation from the clicked cell
        const clickedTeamAbv = eventData.points[0].x;
        
        // Update the table based on the clicked team
        updateTableForTeam(clickedTeamAbv);
      });
  });
}

// Call function on page load
document.addEventListener("DOMContentLoaded", createHeatmap);

function makeTable(data) {
  // Clear Table
  tbody.html("");
  dt_table.clear().destroy();
  
  // Create Table
  for (let i = 0; i < data.length; i++) {
    let row = data[i];

    // Create Table Row
    let table_row = tbody.append("tr").style("background-color", "#808080");

    // Append Cells
    table_row.append("td").text(row.year);
    table_row.append("td").text(row.player_name);
    table_row.append("td").text(row.player_position);
    table_row.append("td").text(row.team);
    table_row.append("td").text(row.team_abv);
    table_row.append("td").text(row.G);
    table_row.append("td").text(row.AB);
    table_row.append("td").text(row.R);
    table_row.append("td").text(row.H);
    table_row.append("td").text(row.HR);
    table_row.append("td").text(row.RBI);
    table_row.append("td").text(row.BB);
    table_row.append("td").text(row.SO);
    table_row.append("td").text(row.AVG);
    table_row.append("td").text(row.league);
    table_row.append("td").text(row.division);
  }

  // Make Table Interactive (again)
  dt_table = new DataTable('#mlb_table', { order: [[0, 'desc']] });
}

// Define Team Colors
let team_colors = {
  "ARI": "#A91D2D", "ATL": "#CE1141", "BAL": "#FF5100", "BOS": "#BD3039", "CHC": "#0E4CB6",
  "CWS": "#404040", "CIN": "#D50032", "CLE": "#E63946", "COL": "#5E1C8A", "DET": "#0C2C56",
  "HOU": "#FF6F1F", "KC": "#0072CE", "LAA": "#DC002E", "LAD": "#0066B3", "MIA": "#00C3E3",
  "MIL": "#2C3E50", "MIN": "#002B75", "NYM": "#F5751D", "NYY": "#1D2951", "OAK": "#026E00",
  "PHI": "#E60026", "PIT": "#FDD017", "SD": "#4D3B24", "SF": "#FE4C1E", "SEA": "#005C7C",
  "STL": "#C41E3A", "TB": "#9ACEEB", "TEX": "#BF0D3E", "TOR": "#2359C7", "WSH": "#C8102E"
};

// Define a function to update the table with filtered data based on the team clicked in the heatmap
function updateTableForTeam(teamAbv) {
  // Filter the data based on the team abbreviation
  const filteredData = data.filter(row => row.team_abv === teamAbv);

  // Call your makeTable function with the filtered data
  makeTable(filteredData);
}

