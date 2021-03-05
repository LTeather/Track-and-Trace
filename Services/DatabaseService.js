class DatabaseService {
    // Create the database pool, so it can be queried
    constructor(pool) {
        this.pool = pool;
    }

    // Function to find if a user is in the "infected" table
    async findUserByEmail(data) {
        const query = 'SELECT * FROM cases WHERE email="' + data + '"';

        return new Promise((resolve, reject) => {
            this.pool.query(query, function (err, rows) {
              if (err) reject(err);
              resolve(rows);
            });
        }); 
    }

    // Function to find if a user is in the "infected" table
    async findUserByPhone(data) {
        const query = 'SELECT * FROM cases WHERE phone="' + data + '"';

        return new Promise((resolve, reject) => {
            this.pool.query(query, function (err, rows) {
              if (err) reject(err);
              resolve(rows);
            });
        }); 
    }
}
module.exports = DatabaseService;