var ctx = document.getElementById("chart").getContext("2d");

var rgb = "0,126,255";
var data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
        {
            label: "Monthly",
            fillColor: "rgba(" + rgb + ",0.25)",
            strokeColor: "rgba(" + rgb + ",1)",
            pointColor: "#fff",
            pointStrokeColor: "rgba(" + rgb + ",1)",
            pointHighlightFill: "rgba(" + rgb + ",1)",
            pointHighlightStroke: "#fff",
            data: [28, 48, 40, 19, 86, 27, 90]
        }
    ]
};

var lineChart = new Chart(ctx).Line(data, {
  responsive: true,
  maintainAspectRatio: true,
  //Number - Radius of each point dot in pixels
  pointDotRadius : 5,
  //Number - Pixel width of point dot stroke
  pointDotStrokeWidth : 3,
  datasetStrokeWidth : 4,
  scaleShowHorizontalLines: false,
  scaleShowVerticalLines: true,
});