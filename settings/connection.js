const mysql   = require('mysql');

module.exports = {

//datos de conexión en local
    /*
    con : mysql.createConnection({
        host: "localhost",
        user:"root",
        password:"",
        database:"api_db"
    })
    */

//datos de conexión en cloud
    
    con : mysql.createConnection({
        host: "127.0.0.1",
        user:"rodolfo",
        password:"12345678",
        database:"api_db"
    })
}
