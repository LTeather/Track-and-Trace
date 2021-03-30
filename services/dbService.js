const mongoose = require('mongoose');
const Crypto = require('crypto-js');

// User Table Creation
const UserSchema = new mongoose.Schema({
    identifier: { type: String },
    username: { type: String, required: true },
    password: { type: String, required: true },
    location: { type: String },
    level: { type: Number, default: 0 },
});

// Cases Table Creation
const CasesSchema = new mongoose.Schema({
    identifier: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, default: 0 },
    time: { type: String, default: "00/00/0000 00:00" },
    location: { type: String, required: true },
});

// Initalise tables for use
const users = mongoose.model('users', UserSchema);
const cases = mongoose.model('cases', CasesSchema);

class databaseService {
    constructor(database) {
        this.database = database;
    }     

    async decrypt(data) {
        return new Promise((resolve, reject) => {
            var bytes  = Crypto.AES.decrypt(data, '?SHUProject2021?');
            var decryptedData = bytes.toString(Crypto.enc.Utf8);
            resolve(decryptedData);
        });
    } 

    async toHHMMSS(seconds) {
        seconds = 86400 - seconds;
        var hours   = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds - (hours * 3600)) / 60);
        var seconds = seconds - (hours * 3600) - (minutes * 60);
    
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours + ':' + minutes + ':' + seconds;
    }

    /**
    * All User related stuff
    **/
    async findUserByPhone(identifier) {
        var id = await this.decrypt(identifier);
        return new Promise((resolve, reject) => {
            users.find({discordId: id}, (err, res) => {
              if (err) return false;
              resolve(res[0]);
            });
        }); 
    }

    async findUserByEmail(discordId) {
        return new Promise((resolve, reject) => {
            users.find({discordId: discordId}, (err, res) => {
              if (err) return false;
              resolve(res[0]);
            });
        }); 
    }    

    async checkUserByPhone(identifier) {
        return new Promise((resolve, reject) => {
            cases.find({phone: identifier}, { limit: 1 }, (err, res) => {
              if (err) return null;
              resolve(res);
            });
        });        
    }

    async checkUserByEmail(identifier) {
        return new Promise((resolve, reject) => {
            cases.find({email: identifier}, { limit: 1 }, (err, res) => {
              if (err) return null;
              resolve(res);
            });
        });        
    }

}

module.exports = databaseService;