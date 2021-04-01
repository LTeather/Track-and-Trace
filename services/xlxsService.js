
const xlsx = require("xlsx");

const clients = [];
var client = {};

class xlxsService {
    constructor(xlxs) {
        this.xlxs = xlxs;
    }     

    async processSheet(location) {
        const filePath = location;
        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        return new Promise((resolve, reject) => {
            for (let cell in worksheet) {
                const cellAsString = cell.toString();
            
                if(cellAsString[1] !== 'r' && cellAsString[1] !== 'm' && cellAsString[1] > 1) {
                    if(cellAsString[0] === 'A') {
                        client.name = worksheet[cell].v;
                    }
                    if(cellAsString[0] === 'B') {
                        client.phone = worksheet[cell].v;
                    }
                    if(cellAsString[0] === 'C') {
                        client.email = worksheet[cell].v;
                    }
                    if(cellAsString[0] === 'D') {
                        client.time = worksheet[cell].v;
                        clients.push(client);
                        client = {};
                    }
                }
            }
            resolve(clients);
        });
    }

}

module.exports = xlxsService;