const mysql   = require('mysql');

module.exports = {
    con : mysql.createConnection({
        host: "localhost",
        user:"rodolfo",
        password:"X+92Qk3yJcBu",
        database:"api_db"
    })
}
