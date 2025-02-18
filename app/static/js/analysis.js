// Define team colors
let team_colors = {
    "ARI": "#A91D2D", "ATL": "#CE1141", "BAL": "#FF5100", "BOS": "#BD3039", "CHC": "#0E4CB6",
    "CWS": "#404040", "CIN": "#D50032", "CLE": "#E63946", "COL": "#5E1C8A", "DET": "#0C2C56",
    "HOU": "#FF6F1F", "KC": "#0072CE", "LAA": "#DC002E", "LAD": "#0066B3", "MIA": "#00C3E3",
    "MIL": "#2C3E50", "MIN": "#002B75", "NYM": "#F5751D", "NYY": "#1D2951", "OAK": "#026E00",
    "PHI": "#E60026", "PIT": "#FDD017", "SD": "#4D3B24", "SF": "#FE4C1E", "SEA": "#005C7C",
    "STL": "#C41E3A", "TB": "#9ACEEB", "TEX": "#BF0D3E", "TOR": "#2359C7", "WSH": "#C8102E"
};

// Plot title labels
const statLabels = {
    "total_hits": "Total Hits",
    "total_home_runs": "Home Runs",
    "total_runs": "Total Runs",
    "total_rbi": "Total RBIs",
    "total_strikeouts": "Total Strikeouts",
    "total_walks": "Total Walks",
    "avg_batting": "Batting Average",
    "avg_slugging": "Slugging Percentage"
};

// Data storage
let fullData = [];

// Load data from API
d3.json("/api/v1.0/regression_data").then(function(data) {
    fullData = data;

    // Set default selection
    updateRegressionPlot("2019", "total_hits", "total_home_runs");
});

// Regression update function
function updateRegressionPlot(selectedYear, xStat, yStat) {
    let filteredData = fullData.filter(d => d.year == selectedYear);

    let teams = filteredData.map(d => `${d.team} (${d.team_abv})`);
    let teamAbvs = filteredData.map(d => d.team_abv);
    let xValues = filteredData.map(d => d[xStat]);
    let yValues = filteredData.map(d => d[yStat]);

    let colors = teamAbvs.map(team => team_colors[team] || "#888888");

    // Perform regression
    let regressionResult = regressionLine(xValues, yValues);
    let equation = `y = ${regressionResult.slope.toFixed(2)}x + ${regressionResult.intercept.toFixed(2)}`;

    // Create scatter plot
    let scatter = {
        x: xValues,
        y: yValues,
        text: teams,
        mode: "markers",
        type: "scatter",
        name: "Data Points",
        marker: { color: colors, size: 10 }
    };

    // Regression line
    let regressionLinePlot = {
        x: regressionResult.x,
        y: regressionResult.y,
        mode: "lines",
        type: "scatter",
        name: "Regression Line",
        line: { color: "red" }
    };

    // Layout
    let layout = {
        title: `${statLabels[xStat] || xStat} vs ${statLabels[yStat] || yStat} (${selectedYear})`,
        xaxis: { title: statLabels[xStat] },
        yaxis: { title: statLabels[yStat] },
        annotations: [
            {
                xref: "paper", 
                yref: "paper",
                x: 0.95,
                y: 0.05,
                text: equation,
                showarrow: false,
                font: { size: 14, color: "black" }
            }
        ]
    };

    Plotly.newPlot("regression_plot", [scatter, regressionLinePlot], layout);
}

// Dynamically update dropdowns
function updateDropdownOptions() {
    let xSelected = d3.select("#x-stat-dropdown").property("value");
    let ySelected = d3.select("#y-stat-dropdown").property("value");

    d3.select("#x-stat-dropdown")
        .selectAll("option")
        .property("disabled", function() { return this.value === ySelected; });

    d3.select("#y-stat-dropdown")
        .selectAll("option")
        .property("disabled", function() { return this.value === xSelected; });
}

// Function for dropdown selection/API matching
function mapStatToColumn(stat) {
    const statMap = {
        "H": "total_hits",
        "HR": "total_home_runs",
        "R": "total_runs",
        "RBI": "total_rbi",
        "SO": "total_strikeouts",
        "BB": "total_walks"
    };
    return statMap[stat] || stat;
}

// Function to calculate linear regression
function regressionLine(xValues, yValues) {
    let n = xValues.length;
    let sumX = d3.sum(xValues);
    let sumY = d3.sum(yValues);
    let sumXY = d3.sum(xValues.map((x, i) => x * yValues[i]));
    let sumXX = d3.sum(xValues.map(x => x * x));

    let slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    let intercept = (sumY - slope * sumX) / n;

    let xMin = Math.min(...xValues);
    let xMax = Math.max(...xValues);
    let regressionX = [xMin, xMax];
    let regressionY = [intercept + slope * xMin, intercept + slope * xMax];

    return { x: regressionX, y: regressionY, slope, intercept };
}

// Event Listeners
d3.select("#year-dropdown").on("change", function () {
    updateRegressionPlot(
        this.value, 
        mapStatToColumn(d3.select("#x-stat-dropdown").property("value")), 
        mapStatToColumn(d3.select("#y-stat-dropdown").property("value"))
    );
});
d3.select("#x-stat-dropdown").on("change", function () {
    updateDropdownOptions();
    updateRegressionPlot(
        d3.select("#year-dropdown").property("value"), 
        mapStatToColumn(this.value), 
        mapStatToColumn(d3.select("#y-stat-dropdown").property("value"))
    );
});
d3.select("#y-stat-dropdown").on("change", function () {
    updateDropdownOptions();
    updateRegressionPlot(
        d3.select("#year-dropdown").property("value"), 
        mapStatToColumn(d3.select("#x-stat-dropdown").property("value")), 
        mapStatToColumn(this.value)
    );
});