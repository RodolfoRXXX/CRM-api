const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const app     = express();
const keys    = require('../settings/keys');
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

//Verifica el usuario con el código de confirmación recibido en el mail
router.put('/verificate-user', async function(req, res, next){
    try{
        let {codeEmail, id} = req.body;

        const checkCode = `SELECT * FROM users WHERE id = ?`;
        con.query(checkCode, [id], (err, result, fields) => {
            if (result.length) {
                //compruebo el codeEmail con el que me llegó
                if(result[0].codeEmail == codeEmail){
                    const sql = `UPDATE users SET active= ? WHERE id = ?`;
                con.query(sql, [1, id], (err, info, fields) => {
                    if (err) {
                        //error de conexion o para agregar el usuario
                        res.send({status: 0, data: err});
                    } else {
                        //EXITO!
                        result[0].active = 1;
                        let token = jwt.sign({data: result}, 'secret')
                        res.send({status: 1, data: result, token: token});
                    }
                })
                } else{
                    //codeEmail incorrecto
                    res.send({status: 1, data: 'error'});
                }
                
            } else{
                //error porque no existe usuario
                res.send({status: 1, data: 'error'});
            }
        });
    } catch(error){
        //error de conexión
        res.send({status: 0, error: error});
    }
});

//Actualiza la contraseña del usuario
router.put('/updatepassword', async function(req, res, next){
    try {
        let {id, password} = req.body;

        const hashed_password = md5(password.toString())
        const sql = `UPDATE users SET password = ? WHERE id = ?`;
        con.query(sql, [hashed_password, id], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                let token = jwt.sign({data: result}, 'secret')
                res.send({status: 1, data: result, token: token});
            }
        })

    } catch (error) {
        res.send({status: 0, error: error});
    }
});

//Actualiza el correo electrónico del usuario
router.put('/updateemail', async function(req, res, next){
    try {
        let {id, email, codeEmail, active} = req.body;

        const sql = `UPDATE users SET email = ?, codeEmail = ?, active = ? WHERE id = ?`;
        con.query(sql, [email, codeEmail, active, id], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                let token = jwt.sign({data: result}, 'secret')
                res.send({status: 1, data: result, token: token});
            }
        })

    } catch (error) {
        res.send({status: 0, error: error});
    }
});

router.post('/getTagPersonas', auth.verifyToken, async (req, res, next) => {
    try {
        let {id} = req.body;
        const sql = `SELECT * FROM personas WHERE id_autor = ?`;
        con.query(sql, id, (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                res.send({status: 1, data: result});
            }
        })

    } catch (error) {
        res.send({status: 0, error: error});
    }
});

router.get('/', auth.verifyToken, async (req, res) => {
    //Aquí puede retornar información desde la base de datos, ahora devuelve info cualquiera

    res.send({status: 1, data:{username: "Rodolfo", userWebsite: "https://www.google.com", message: "Successful"}})
});

module.exports = router;