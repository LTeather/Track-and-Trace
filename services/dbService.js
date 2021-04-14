const mongoose = require('mongoose');
const Crypto   = require('crypto-js');

// User Table Creation
const UserSchema = new mongoose.Schema({
    identifier: { type: String },
    username: { type: String, required: true },
    password: { type: String, required: true },
    business_name: { type: String, required: true },
    level: { type: Number, default: 0 },
});

// Cases Table Creation
const CasesSchema = new mongoose.Schema({
    identifier: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    date: { type: String, required: true },
});

// Data Table Creation
const DataSchema = new mongoose.Schema({
    identifier: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    time: { type: String, required: true },
    location: { type: String },
});

// Initalise tables for use
const users = mongoose.model('users', UserSchema);
const cases = mongoose.model('cases', CasesSchema);
const data  = mongoose.model('data',  DataSchema);

class databaseService {
    constructor(database) {
        this.database = database;
    }    
    
    // Encrypt password
    async encrypt(data) {
        return new Promise((resolve, reject) => {
            var ciphertext = Crypto.AES.encrypt(data, 'TrackandTrace2021!!!').toString();
            resolve(ciphertext);
        });
    } 

    // Decrypt password
    async decrypt(data) {
        return new Promise((resolve, reject) => {
            var bytes  = Crypto.AES.decrypt(data, 'TrackandTrace2021!!!');
            var decryptedData = bytes.toString(Crypto.enc.Utf8);
            resolve(decryptedData);
        });
    } 

    // Find if there are any users matching the email
    async findUserByEmail(email) {
        return new Promise((resolve, reject) => {
            users.find({email: email}, (err, res) => {
              if (err) return false;
              resolve(res[0]);
            });
        }); 
    }    

    // Find if there are any users matching the identifier
    async findUserByIdentifier(identifier) {
        return new Promise((resolve, reject) => {
            users.find({identifier: identifier}, (err, res) => {
              if (err) return false;
              resolve(res[0]);
            });
        }); 
    }    

    // Find if there are any users matching the phone number
    async checkCasesByPhone(identifier) {
        return new Promise((resolve, reject) => {
            cases.find({phone: identifier}, (err, res) => {
                if (err) return false;
                resolve(res[0]);
            });
        });        
    }

    // Find if there are any users matching the email
    async checkCasesByEmail(identifier) {
        return new Promise((resolve, reject) => {
            cases.find({email: identifier}, (err, res) => {
                if (err) return false;
                resolve(res[0]);
            });
        });        
    }

    // Insert case data from sheet to cases database
    async addSheetDataToCases(sheetData) {
        return new Promise((resolve, reject) => {
            cases.insertMany(sheetData, (err, res) => {
              if (err) return null;
              resolve(res);
            });
        });        
    }

    // Insert customer data from sheet to data database
    async addSheetDataToData(sheetData) {
        return new Promise((resolve, reject) => {
            data.insertMany(sheetData, (err, res) => {
              if (err) { console.log(err); return null; };
              resolve(res);
            });
        });        
    }

    // Find a user in the database by email
    async findUserByEmail(email) {
        return new Promise((resolve, reject) => {
            users.find({username: email}, (err, res) => {
              if (err) return false;
              resolve(res[0]);
            });
        }); 
    }

    // Find a user in the database by business name
    async findUserByBusiness(business) {
        return new Promise((resolve, reject) => {
            users.find({business_name: business}, (err, res) => {
              if (err) return false;
              resolve(res[0]);
            });
        }); 
    }

    // Insert new user into database
    async addUser(business, email, password) {
        let hashedPassword = await this.encrypt(password);
        let user = { username: email, password: hashedPassword, business_name: business };
        let userFind = await this.findUserByEmail(email);

        if(userFind === undefined) {
            return new Promise((resolve, reject) => {
                users.insertMany(user, (err, res) => {
                  if (err) { console.log(err); return null; };
                  resolve(res);
                });
            });  
        }
    }

    // Get Stats for Dashboard
    async getCasesStat() {
        return new Promise((resolve, reject) => {
            cases.countDocuments({}, function(err, result) {
              if (err) return reject(false);
              resolve(result);
            });
        });
    }

    // Get Stats for Dashboard
    async getInputStat() {
        return new Promise((resolve, reject) => {
            data.countDocuments({}, function(err, result) {
              if (err) return reject(false);
              resolve(result);
            });
        });
    }

    // Get Stats for Dashboard
    async getAlertedStat() {
        return new Promise((resolve, reject) => {
            cases.countDocuments({}, function(err, result) {
              if (err) return reject(false);
              resolve(result);
            });
        });
    }
}

module.exports = databaseService;