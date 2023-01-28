// Function for Make AJAX Request 
function makeAJAXRequest(method, url, callback) {

  let xhr = new XMLHttpRequest();     // Make object of XMLHttpRequest()
  xhr.open(method, url);    // Open() specifies request type and URL
  xhr.setRequestHeader('Accept', 'application/json'); // Set header - Accept indicates output in JSON
  xhr.setRequestHeader('Content-Type', 'application/json');   // Set header - Content-Type that indicates request body is in JSON

  // When response is ready
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      callback(xhr.response);
    }
  }

  xhr.send(); // Sends the request
}

makeAJAXRequest('POST','/index/seller-overview', displayChart);

// Function for display Chart with data
function displayChart(data) {
  let chartData = JSON.parse(data).data;
  let chartDataKeys = Object.keys(chartData);
  google.charts.load('current', { 'packages': ['bar'] });
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    var data = google.visualization.arrayToDataTable([
      ['Month', 'Orders'],
      [shortYear(chartDataKeys[0]), chartData[chartDataKeys[0]]],
      [shortYear(chartDataKeys[1]), chartData[chartDataKeys[1]]],
      [shortYear(chartDataKeys[2]), chartData[chartDataKeys[2]]],
      [shortYear(chartDataKeys[3]), chartData[chartDataKeys[3]]],
      [shortYear(chartDataKeys[4]), chartData[chartDataKeys[4]]],
      [shortYear(chartDataKeys[5]), chartData[chartDataKeys[5]]],
      [shortYear(chartDataKeys[6]), chartData[chartDataKeys[6]]],
      [shortYear(chartDataKeys[7]), chartData[chartDataKeys[7]]],
      [shortYear(chartDataKeys[8]), chartData[chartDataKeys[8]]],
      [shortYear(chartDataKeys[9]), chartData[chartDataKeys[9]]],
      [shortYear(chartDataKeys[10]), chartData[chartDataKeys[10]]],
      [shortYear(chartDataKeys[11]), chartData[chartDataKeys[11]]]
    ]);

    var options = {
      chart: {
          title: 'Completed Orders',
          subtitle: `Completed orders by Seller chart : ${new Date().getFullYear()-1}-${new Date().getFullYear()}`,
      },
    };

    var chart = new google.charts.Bar(document.getElementById('sellers-orders-chart'));

    chart.draw(data, google.charts.Bar.convertOptions(options));
  }
}

// Helper functions
function shortYear(chartDataValue) {
  return chartDataValue.slice(0, 4) + chartDataValue.slice(6);
}