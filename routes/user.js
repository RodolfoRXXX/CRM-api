const express = require('express');
const router  = express.Router();
const app = express();
const keys = require('../settings/keys');
app.set('keys', keys.key);

const md5     = require('md5');
const jwt     = require('jsonwebtoken');
const mysql   = require('mysql');

const con = mysql.createConnection({
    host: "localhost",
    user:"root",
    password:"",
    database:"api_db"
});

//Obtener el listado de usuarios(GET)
router.post('/register', async function(req, res, next){
    try{
        let {username, email, password} = req.body;

        const hashed_password = md5(password.toString())

        const checkUsername = `SELECT username FROM users WHERE username = ?`;
        con.query(checkUsername, [username], (err, result, fields) => {
            if (!result.length) {
                const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
                con.query(sql, [username, email, hashed_password], (err, result, fields) => {
                    if (err) {
                        res.send({status: 0, data: err});
                    } else {
                        let token = jwt.sign({data: result}, app.get('key'))
                        res.send({status: 1, data: result, token: token});
                    }
                })
            }
        });
    } catch(error){
        res.send({status: 0, error: error});
    }
});

router.post('/login', async function(req, res, next){
    try {
        let {username, password} = req.body;

        const hashed_password = md5(password.toString())
        const sql = `SELECT * FROM users WHERE username = ? AND password = ?`
        con.query(sql, [username, hashed_password], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                let token = jwt.sign({data: result}, app.get('key'))
                res.send({status: 1, data: result, token: token});
            }
        })

    } catch (error) {
        res.send({status: 0, error: error});
    }
});


module.exports = router;