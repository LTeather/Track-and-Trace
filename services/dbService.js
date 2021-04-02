const mongoose = require('mongoose');

// User Table Creation
const UserSchema = new mongoose.Schema({
    identifier: { type: String },
    username: { type: String, required: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
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
}

module.exports = databaseService;