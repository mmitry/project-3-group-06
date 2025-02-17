// Store all regression data
let fullRegressionData = [];

// Load from API
function loadRegressionData() {
    d3.json("/api/v1.0/regression_data").then(function (data) {
        fullRegressionData = data;
        updateRegressionPlots("2019"); // Set initial year
    });
}

// Year filter
function updateRegressionPlots(selectedYear) {
    let filteredData = fullRegressionData.filter(d => d.year == selectedYear);

    if (filteredData.length === 0) {
        console.warn(`No regression data found for year ${selectedYear}.`);
        return;
    }

    // Extract for Hits vs. Home Runs
    let hits = filteredData.map(d => d.total_hits);
    let homeRuns = filteredData.map(d => d.total_home_runs);
    let regressionHitsHR = regressionLine(hits, homeRuns);

    // Create Scatter Plot
    let hitsHRScatter = {
        x: hits,
        y: homeRuns,
        mode: "markers",
        type: "scatter",
        name: "Data Points",
        marker: { color: "blue" }
    };

    // Create Regression Line
    let hitsHRLine = {
        x: regressionHitsHR.x,
        y: regressionHitsHR.y,
        mode: "lines",
        type: "scatter",
        name: "Regression Line",
        line: { color: "red" }
    };

    // Layout
    let hitsHRLayout = {
        title: `Hits vs Home Runs (${selectedYear})`,
        xaxis: { title: "Total Hits" },
        yaxis: { title: "Total Home Runs" }
    };

    Plotly.newPlot("hits_vs_hr", [hitsHRScatter, hitsHRLine], hitsHRLayout);

    // Extract for Strikeouts vs. Home Runs
    let strikeouts = filteredData.map(d => d.total_strikeouts);
    let regressionSOHR = regressionLine(strikeouts, homeRuns);

    // Create Scatter Plot
    let soHRScatter = {
        x: strikeouts,
        y: homeRuns,
        mode: "markers",
        type: "scatter",
        name: "Data Points",
        marker: { color: "green" }
    };

    // Create Regression Line
    let soHRLine = {
        x: regressionSOHR.x,
        y: regressionSOHR.y,
        mode: "lines",
        type: "scatter",
        name: "Regression Line",
        line: { color: "red" }
    };

    // Layout
    let soHRLayout = {
        title: `Strikeouts vs Home Runs (${selectedYear})`,
        xaxis: { title: "Total Strikeouts" },
        yaxis: { title: "Total Home Runs" }
    };

    Plotly.newPlot("so_vs_hr", [soHRScatter, soHRLine], soHRLayout);
}

// Calculate linear regression
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

// Listen for year selection change
$("#year-dropdown").on("change", function () {
    updateRegressionPlots(this.value);
});

// Load data on page load
$(document).ready(function () {
    loadRegressionData();
});