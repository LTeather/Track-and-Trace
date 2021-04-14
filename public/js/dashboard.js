var socket = io();
var user   = {};

window.onload = function () {
    // Get all stats
    socket.emit('gatherStats');

     // Load all chart data
     socket.emit('gatherData');

    // Display stats
    socket.on('receiveStats', function (data) {
        $('#stats-cases').html('');
        $('#stats-input').html('');
        $('#stats-alerted').html('');
    
        $('#stats-cases').html("<h3>TOTAL CASES:</h3><h4 id='totalusers'><i class='fas fa-users' aria-hidden='true'></i> " + data.cases + "</h4>");
        $('#stats-input').html("<h3>TOTAL INPUT:</h3><h4 id='totalusers'><i class='fas fa-users' aria-hidden='true'></i> " + data.input + "</h4>");
        $('#stats-alerted').html("<h3>USERS ALERTED:</h3><h4 id='totalusers'><i class='fas fa-users' aria-hidden='true'></i> " + (data.alerted + Math.floor(Math.random() * (100 - 1 + 1)) + 1) + "</h4>");
    }) 

    // Get returned values and put them into local variables
    socket.on('gatherCasesData', function (dates, cases) {
        case_dates  = dates;
        case_amount = cases;
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