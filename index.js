require('dotenv').config();

const dbService = require('./services/dbService');

let express = require('express');
let app     = express();
let http    = require("http").Server(app)
let io      = require('socket.io')(http)
let fs      = require('fs')
let path    = require('path')
const axios      = require("axios");
const passport   = require('passport');
const database   = require('./database/database');
const mongoose   = require('mongoose');
const session    = require('express-session');
const MongoStore = require('connect-mongo')(session);

// Connect to the database
database.then(() => console.log('Connected to MongoDB.')).catch(err => console.log(err));

// Initialise the database service
var databaseService = new dbService(database);

// Global Variables
global.casesData = []; 
global.cases_dates = [];
global.cases_amount = [];

// All the real time update functions will occur in here
io.on('connection', function(socket) {
	socket.on('checkUser', async function (data) {
		var numbers = /^[0-9]+$/;
		var result;

      	if (data.match(numbers)) { result = await databaseService.checkUserByPhone(); }
		else { result = await databaseService.checkUserByEmail(); }

		console.log(result);

		if(result.length == 0) {
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

// Setup Cookie data for cached login sessions
app.use(session({
    secret: 'SHUProject2021',
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    saveUninitialized: false,
    resave: false,
    name: 'TrackandTrace',
    store: new MongoStore({ mongooseConnection:  mongoose.connection })
}));

// Setup template engine of website
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Cookie sessions for login data
app.use(passport.initialize());
app.use(passport.session());

// Setup routing for when user logged in
const authRoute = require('./routes/auth');
app.use('/auth', authRoute);

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/login', (req, res) => {
	res.render('login');
});

function isAuthorized(req, res, next) {
	if(req.user) { res.redirect('/dashboard'); }
	else { next(); }			
}

app.get('/dashboard', isAuthorized, (req, res) => {
	res.render('dashboard');
});

app.get('/cases', isAuthorized, (req, res) => {
	res.render('cases');
});

app.get('/data', isAuthorized, (req, res) => {
	res.render('data');
});

app.get('/support', isAuthorized, (req, res) => {
	res.render('support');
});

http.listen(port, function(){
	console.log('Track & Trace Started!')
  	console.log('listening on :' + port)
});