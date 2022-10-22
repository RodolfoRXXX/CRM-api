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

//Registra un usuario nuevo
router.post('/register', async function(req, res, next){
    try{
        let {email, password, nombre, codeEmail, active} = req.body;

        const hashed_password = md5(password.toString())

        const checkEmail = `SELECT email FROM users WHERE email = ?`;
        con.query(checkEmail, [email], (err, result, fields) => {
            if (!result.length) {
                //exito en no encontrar usuario
                const sql = `INSERT INTO users (email, password, nombre, codeEmail, active) VALUES (?, ?, ?, ?, ?)`;
                con.query(sql, [email, hashed_password, nombre, codeEmail, active], (err, result, fields) => {
                    if (err) {
                        //error de conexion o para agregar el usuario
                        res.send({status: 0, data: err});
                    } else {
                        let user = [{email: email, password: hashed_password, nombre: nombre, id: result.insertId, codeEmail: codeEmail, active: active}]
                        //éxito al agregar el usuario
                        let token = jwt.sign({data: user}, 'secret')
                        res.send({status: 1, data: user, token: token});
                    }
                })
            } else{
                //error porque existe usuario
                res.send({status: 1, data: 'existente'});
            }
        });
    } catch(error){
        //error de conexión
        res.send({status: 0, error: error});
    }
});

//Comprueba las credenciales de usuario y dá acceso
router.post('/login', async function(req, res, next){
    try {
        let {email, password} = req.body;

        const hashed_password = md5(password.toString())
        const sql = `SELECT * FROM users WHERE email = ? AND password = ?`
        con.query(sql, [email, hashed_password], (err, result, field) => {
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

//Comprueba que el correo electrónico pertenezca a una cuenta y envía las credenciales
router.post('/forgot', async function(req, res, next){
    try{
        let {email} = req.body;

        const checkEmail = `SELECT * FROM users WHERE email = ?`;
        con.query(checkEmail, [email], (err, result, fields) => {
            if (!result.length) {
                //no encontró el email
                res.send({status: 1, data: 'noencontrado'});
            } else{
                //encontró el email
                res.send({status: 1, data: result});
            }
        });
    } catch(error){
        //error de conexión
        res.send({status: 0, error: error});
    }
});

//Recibe el código externo y verifica si existe y entrega su información para ser mostrada
router.post('/get-tag-out', async function(req, res, next){
    try{
        let {code} = req.body;
        let tipo;
        const checkQR = `SELECT * FROM tablaqr WHERE codigo = BINARY ?`;
        con.query(checkQR, code, (err, result, fields) => {
            if(err){
                res.send({status: 0, data: err});
            } else{
                if (!result.length) {
                    //no encontró el qr
                    res.send({status: 0, data: 'noqr'});
                } else{
                    //encontró el qr, ahora debe verificar si está utilizado
                    if(!result[0].tipo){
                        //el qr no está utilizado
                        res.send({status: 0, data: 'nolink'}); 
                    } else{
                        //qr utilizado y devuelve valores
                        tipo = result[0].tipo;
                        const checkTag = `SELECT * FROM ${result[0].tipo} WHERE id_qr = ?`;
                        con.query(checkTag, result[0].id, (err, result, fields) => {
                            if(err){
                                res.send({status: 0, data: err});
                            } else{
                                if (!result.length) {
                                    //no encontró el tag asociado al qr obtenido previamente
                                    res.send({status: 0, data: 'notag'});
                                } else{
                                    //Encontró el tag asociado al qr y lo devuelve
                                    res.send({status: 1, data: result, tipo: tipo});
                                }
                            }    
                        })
                    }
                }
            }
            
        });
    } catch(error){
        //error de conexión
        res.send({status: 0, error: error});
    }
});

module.exports = router;