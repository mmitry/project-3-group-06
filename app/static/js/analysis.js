// Define team colors
let team_colors = {
    "ARI": "#A91D2D", "ATL": "#CE1141", "BAL": "#FF5100", "BOS": "#BD3039", "CHC": "#0E4CB6",
    "CWS": "#404040", "CIN": "#D50032", "CLE": "#E63946", "COL": "#5E1C8A", "DET": "#0C2C56",
    "HOU": "#FF6F1F", "KC": "#0072CE", "LAA": "#DC002E", "LAD": "#0066B3", "MIA": "#00C3E3",
    "MIL": "#2C3E50", "MIN": "#002B75", "NYM": "#F5751D", "NYY": "#1D2951", "OAK": "#026E00",
    "PHI": "#E60026", "PIT": "#FDD017", "SD": "#4D3B24", "SF": "#FE4C1E", "SEA": "#005C7C",
    "STL": "#C41E3A", "TB": "#9ACEEB", "TEX": "#BF0D3E", "TOR": "#2359C7", "WSH": "#C8102E"
};

// Load from API
d3.json("/api/v1.0/regression_data").then(function(data) {

    // Function to update regression plots based on selected year
    function updateRegressionPlots(selectedYear) {
        let filteredData = data.filter(d => d.year == selectedYear);

        // Extract for Hits vs. Home Runs
        let teams = filteredData.map(d => `${d.team} (${d.team_abv})`);
        let teamAbvs = filteredData.map(d => d.team_abv);
        let hits = filteredData.map(d => d.total_hits);
        let homeRuns = filteredData.map(d => d.total_home_runs);

        // Assign colors based on team
        let colors = teamAbvs.map(team => team_colors[team] || "#888888");

        // Linear Regression (Hits vs. Home Runs)
        let regressionHitsHR = regressionLine(hits, homeRuns);

        // Create Plot
        let hitsHRScatter = {
            x: hits,
            y: homeRuns,
            text: teams,  // Display team names on hover
            mode: "markers",
            type: "scatter",
            name: "Data Points",
            marker: { color: colors, size: 10 }
        };

        let hitsHRLine = {
            x: regressionHitsHR.x,
            y: regressionHitsHR.y,
            mode: "lines",
            type: "scatter",
            name: "Regression Line",
            line: { color: "red" }
        };

        let hitsHRLayout = {
            title: `Hits vs Home Runs (${selectedYear})`,
            xaxis: { title: "Total Hits" },
            yaxis: { title: "Total Home Runs" }
        };

        Plotly.newPlot("hits_vs_hr", [hitsHRScatter, hitsHRLine], hitsHRLayout);

        // Extract for Strikeouts vs. Home Runs
        let strikeouts = filteredData.map(d => d.total_strikeouts);
        let regressionSOHR = regressionLine(strikeouts, homeRuns);

        // Create Plot
        let soHRScatter = {
            x: strikeouts,
            y: homeRuns,
            text: teams,  // Display team names on hover
            mode: "markers",
            type: "scatter",
            name: "Data Points",
            marker: { color: colors, size: 10 }
        };

        let soHRLine = {
            x: regressionSOHR.x,
            y: regressionSOHR.y,
            mode: "lines",
            type: "scatter",
            name: "Regression Line",
            line: { color: "red" }
        };

        let soHRLayout = {
            title: `Strikeouts vs Home Runs (${selectedYear})`,
            xaxis: { title: "Total Strikeouts" },
            yaxis: { title: "Total Home Runs" }
        };

        Plotly.newPlot("so_vs_hr", [soHRScatter, soHRLine], soHRLayout);
    }

    // Initialize Plots with Default Year
    let defaultYear = "2019";
    updateRegressionPlots(defaultYear);

    // Listen for year selection change
    d3.select("#year-dropdown").on("change", function () {
        updateRegressionPlots(this.value);
    });
});

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

    return { x: regressionX, y: regressionY };
}