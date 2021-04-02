require('dotenv').config();

const dbService   = require('./services/dbService');
const xlsxService = require('./services/xlxsService');

let express = require('express');
let app     = express();
let http    = require("http").Server(app)
let io      = require('socket.io')(http)
let fs      = require('fs')
const multer     = require('multer');
const path       = require('path');
const axios      = require("axios");
const xlsx       = require("xlsx");
const passport   = require('passport');
const database   = require('./database/database');
const mongoose   = require('mongoose');
const session    = require('express-session');
const MongoStore = require('connect-mongo')(session);
const xlstojson  = require("xls-to-json-lc");
const xlsxtojson = require("xlsx-to-json-lc");

// Connect to the database
database.then(() => console.log('Connected to MongoDB.')).catch(err => console.log(err));

// Initialise the database service
var databaseService = new dbService(database);

// Initialise the Excel sheet processing service
var sheetService = new xlsxService(xlsx);

// Global Variables
global.casesData = []; 
global.cases_dates = [];
global.cases_amount = [];

// All the real time update functions will occur in here
io.on('connection', function(socket) {
	socket.on('checkUser', async function (data) {
		var numbers = /^[0-9]+$/;
		var result;

		// Preform check based on if an phone number or email is input
      	if (data.match(numbers)) { result = await databaseService.checkUserByPhone(); }
		else { result = await databaseService.checkUserByEmail(); }

		console.log(result);

		// If there are no results found present the all clear
		if(result.length == 0) {
			socket.emit('clearPopup');
		}
		// Otherwise there must have been a case found
		else {
			socket.emit('isolatePopup');
		}
	});

	// Gathers data from API to populate cases chart
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

// Set a location for Multer to store uploads
var storage = multer.diskStorage({ 
	destination: function (req, file, cb) {
		cb(null, './uploads/')
	},
	filename: function (req, file, cb) {
		var datetimestamp = Date.now();
		cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
	}
});

// Settings for multer
var upload = multer({ 
				storage: storage,
				fileFilter : function(req, file, callback) { // File filter
					if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
						return callback(new Error('Wrong extension type'));
					}
					callback(null, true);
				}
			}).single('file');

// Port for connection/hosting website
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
const { post } = require('./routes/auth');
app.use('/auth', authRoute);

// Homepage
app.get('/', (req, res) => {
	res.render('index');
});

// Page for logging in
app.get('/login', (req, res) => {
	res.render('login');
});

// To check if a user is logged in and allowed to view the dashboard
function isAuthorized(req, res, next) {
	if(req.user) { res.redirect('/dashboard'); }
	else { next(); }			
}

// Dashboard homepage
app.get('/dashboard', isAuthorized, (req, res) => {
	res.render('dashboard');
});

// Page on dashboard for uploading data
app.get('/data', isAuthorized, (req, res) => {
	res.render('data');
});

// Page on dashboard for FAQ
app.get('/support', isAuthorized, (req, res) => {
	res.render('support');
});

// Page for successful upload
app.get('/success', isAuthorized, (req, res) => {
	res.render('success');
});

// Function to Process uploaded data
async function processSheetData(location) {
	result = await sheetService.processSheet(location);
	result2 = await databaseService.addSheetDataToData(result);

	// Delete the temporary file after being processing
	try {
		fs.unlinkSync(location)
		//file removed
	  } catch(err) {
		console.error(err)
	}

	return;
}

// API path that will upload the files
app.post('/uploadSheet', function(req, res) {
	var exceltojson;
	upload(req,res,function(err){
		if(err){
			 res.json({error_code:1,err_desc:err});
			 return;
		}
		/** Multer gives us file info in req.file object */
		if(!req.file){
			res.json({error_code:1,err_desc:"No file passed"});
			return;
		}
		/** Check the extension of the incoming file and 
		 *  use the appropriate module
		 */
		if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
			exceltojson = xlsxtojson;
		} else {
			exceltojson = xlstojson;
		}

		//If all tests passed, upload and process the sheet
		processSheetData(req.file.path);

		//Redirect back to dashboard
		res.redirect('success');
	})
   
});

// Runs at launch to show everything is working
http.listen(port, function(){
	console.log('Track & Trace Started!')
  	console.log('listening on :' + port)
});