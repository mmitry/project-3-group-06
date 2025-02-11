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
    height: 500
  };

  // Render the plot to the div tag with id "plot"
  Plotly.newPlot('plot', traces, layout);
}

function makeTable(data) {
  // Clear Table
  tbody.html("");
  dt_table.clear().destroy();
  
    // Create Table
    for (let i = 0; i < data.length; i++) {
      let row = data[i];
  
      // Create Table Row
      let table_row = tbody.append("tr");
  
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