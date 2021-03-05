var socket = io();

var case_dates  = [];
var case_amount = [];

// Send data to server when input button is pressed
function checkUser() {
    socket.emit('checkUser', $('#userCheck').val());
    ui.infectedPopup();
}

window.onload = function () {
    // Load all chart data
    socket.emit('gatherData');

    // Get returned values and put them into local variables
    socket.on('gatherCasesData', function (dates, cases) {
        case_dates  = dates;
        case_amount = cases;
    })   

    // Display the "all clear" popup
    socket.on('clearPopup', function () {
        ui.safePopup();
    })   

    // Display the "need to isolate" popup
    socket.on('isolatePopup', function () {
        ui.infectedPopup();
    })
}

// Chart related stuff
var ctx = document.getElementById('myChart');

// Delay showing the chart to wait on data from server
setTimeout(createChart, 500);

function createChart() {
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: case_dates,
            datasets: [{
                label: '# of Cases',
                data: case_amount,
                backgroundColor: 'rgba(0, 94, 184, 0.2)',
                borderColor: 'rgba(0, 94, 184, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}