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

   // Find if there are any users matching the phone number
    async findUserByPhone(identifier) {
        var id = await this.decrypt(identifier);
        return new Promise((resolve, reject) => {
            users.find({discordId: id}, (err, res) => {
              if (err) return false;
              resolve(res[0]);
            });
        }); 
    }

    // Find if there are any users matching the email
    async findUserByEmail(discordId) {
        return new Promise((resolve, reject) => {
            users.find({discordId: discordId}, (err, res) => {
              if (err) return false;
              resolve(res[0]);
            });
        }); 
    }    

    // Find if there are any users matching the phone number
    async checkUserByPhone(identifier) {
        return new Promise((resolve, reject) => {
            cases.find({phone: identifier}, { limit: 1 }, (err, res) => {
              if (err) return null;
              resolve(res);
            });
        });        
    }

    // Find if there are any users matching the email
    async checkUserByEmail(identifier) {
        return new Promise((resolve, reject) => {
            cases.find({email: identifier}, { limit: 1 }, (err, res) => {
              if (err) return null;
              resolve(res);
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

        console.log(userFind);
        console.log(users);

        if(userFind === undefined) {
            console.log(user);
            return new Promise((resolve, reject) => {
                users.insertOne(user, (err, res) => {
                  if (err) { console.log(err); return null; };
                  resolve(res);
                });
            });  
        }
    }
}

module.exports = databaseService;