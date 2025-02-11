// Use D3 to select the table
let table = d3.select("#mlb_table");
let tbody = table.select("tbody");

// Make Table Interactive
let dt_table = new DataTable('#mlb_table');

// Event Listener
d3.select("#filter-btn").on("click", function () {
  doWork();
});

// On Page Load
doWork();

// Helper Functions
function doWork() {
  // Fetch the JSON data and console log it
  d3.json("/api/v1.0/bar_data").then(function (data) {
    // Make Plot
    makeBarPlot(data);
  });

  d3.json("/api/v1.0/table_data").then(function (data) {
    // Make Plot
    makeTable(data);
  });
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
    table_row.append("td").text(row.team_abv);
    table_row.append("td").text(row.total_home_runs);
  }

  // Make Table Interactive (again)
  dt_table = new DataTable('#mlb_table', {
    order: [[0, 'desc']] // Sort by column 1 desc
  });
}


function makeBarPlot(data) {
  // Create Trace
  let trace = {
    x: data.map(row => row.year),
    y: data.map(row => row.total_home_runs),
    type: 'bar',
    marker: {
      color: 'firebrick'
    }
  }

  // Data trace array
  let traces = [trace];

  // Apply a title to the layout
  let layout = {
    title: {
      text: `Number of Homeruns by Year`
    },
    yaxis: {
      title: {
        text: 'NUmber of Homeruns'
      }
    },
    xaxis: {
      title: {
        text: 'Year'
      }
    },
    height: 600
  }

  // Render the plot to the div tag with id "plot"
  Plotly.newPlot('plot', traces, layout);
}

