      google.setOnLoadCallback(drawChart);

      function drawChart(data) {
        var data = google.visualization.arrayToDataTable(data);

        var options = {
          wordtree: {
            format: 'implicit',
            word: 'cats'
          }
        };

        var chart = new google.visualization.WordTree(document.getElementById('sunburst'));
        chart.draw(data, options);
      }