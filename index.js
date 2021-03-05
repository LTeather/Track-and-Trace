require('dotenv').config();

const DatabaseService = require('./Services/DatabaseService');

const express = require('express');
const app     = express();
const http    = require("http").Server(app);
const io      = require('socket.io')(http);
const fs      = require('fs');
const path    = require('path');
const mysql   = require('mysql2/promise');
const axios   = require("axios");

// Get the database information from the file
let dbConfig = {
	connectionLimit: 10, // default 10
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME
};

// Global Variables
global.database;
global.casesData = []; 
global.cases_dates = [];
global.cases_amount = [];

// Create Database Service, connect to the database
async function initializeDatabase() {
	var pool = await mysql.createPool(dbConfig);
	database = new DatabaseService(pool);
}

initializeDatabase();

// All the real time update functions will occur in here
io.on('connection', function(socket) {
	socket.on('checkUser', async function (data) {
		var numbers = /^[0-9]+$/;
		var result;

      	if (data.match(numbers)) { result = await database.findUserByPhone(); }
		else { result = await database.findUserByEmail(); }

		console.log(result);

		if(result == []) {
			socket.emit('clearPopup');
		}
		else {
			socket.emit('isolatePopup');
		}
	});

	socket.on('gatherData', async function() {
		socket.emit('gatherCasesData', cases_dates, cases_amount);
	});
});

// API callpoint for new cases per day from GOV site.
const endpoint = (
    'https://api.coronavirus.data.gov.uk/v1/data?' +
    'filters=areaType=nation;areaName=england&' +
    'structure={"date":"date","newCases":"newCasesByPublishDate"}'
);

// Gets the data using the GOV API.
const getCasesFromAPI = async ( url ) => {
    const { data, status, statusText } = await axios.get(url, { timeout: 10000 });
    if ( status >= 400 ) { throw new Error(statusText); }
    return data;
};

// Runs the API call and returns the results.
const getCases = async () => {
	const result = await getCasesFromAPI(endpoint);
	casesData = result.data;

	for(var i = 0; i < casesData.length; i++ ) {
		cases_dates.push(casesData[i].date);
		cases_amount.push(casesData[i].newCases)
	}

	// Reverse the arrays as the API returns in wrong order
	cases_dates.reverse();
	cases_amount.reverse();
};

// Handler for any errors
getCases().catch(err => {
    console.error(err);
    process.exitCode = 1;
});

// Every 24 Hours, call the get cases to update the new daily count.
setInterval(getCases, 1000 * 60 * 60 * 24);

let port = 1337;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.render('index');
});

http.listen(port, function(){
	console.log('Track & Trace Started!')
  	console.log('listening on :' + port)
});