const mongoose = require('mongoose');

// This file would have had more options depending on the launch method of the application
// to get if it was launched locally or by a deployment method as to if it should use
// the development or a release database connection methods.

// As this is just for local, it does not have this.

global.Environment = "Development";

config = require('./../appsettings.development.json');

module.exports =  mongoose.connect(config.Database.location, { useNewUrlParser: true, useUnifiedTopology: true });