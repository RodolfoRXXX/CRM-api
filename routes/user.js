const express = require('express');
const router  = express.Router();
const app = express();
const keys = require('../settings/keys');
const cors = require('cors');
const bodyParser = require('body-parser');
const configmensaje = require('./configmensaje');

app.use(bodyParser.json());
app.use(cors());
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
        res.send({status: 0, data: error});
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

//Obtiene todos los tags en alerta
router.get('/get-lost-tag', async function(req, res, next){
    try{
        let personas = [];
        let mascotas = [];
        let vehiculos = [];
        const sql_personas = `SELECT * FROM personas WHERE estado = 'alert'`;
        con.query(sql_personas, (err, result, fields) => {
            if(err){
                res.send({status: 0, error: err});
            } else{
                if(result.length){
                    personas.push(...result);
                }
                const sql_mascotas = `SELECT * FROM mascotas WHERE estado = 'alert'`;
                con.query(sql_mascotas, (err, result, fields) => {
                    if(err){
                        res.send({status: 0, error: err});
                    } else{
                        if(result.length){
                            mascotas.push(...result);
                        }
                        const sql_vehiculos = `SELECT * FROM vehiculos WHERE estado = 'alert'`;
                        con.query(sql_vehiculos, (err, result, fields) => {
                            if(err){
                                res.send({status: 0, error: err});
                            } else{
                                if(result.length){
                                    vehiculos.push(...result);
                                }
                                res.send({status: 1, data: {personas:personas, mascotas:mascotas, vehiculos:vehiculos}});
                            }
                        });
                    }
                });
            }
        });
    } catch(error){
        //error de conexión
        res.send({status: 0, error: error});
    }
})

//Setea la posición GPS del tag encontrado
router.post('/set-position-tag', async function(req, res, next){
    try{
        let {tipo, id_user, data} = req.body;
        const sqlPosition = `UPDATE ${tipo} SET position = ? WHERE id = ?`;
        con.query(sqlPosition, [data, id_user], (err, result, fields) => {
            if(err){
                res.send({status: 0, data: err});
            } else{
                if(result.affectedRows == 0){
                    res.send({status: 0, data: 'error'});
                } else{
                    res.send({status: 1, data: 'ok'});
                }
            }
        });
    } catch(error){
        //error de conexión
        res.send({status: 0, data: error});
    }
});

//Envía correo electrónico
router.post('/envio-email', (req, res) => {
    configmensaje(req.body);
    res.status(200).send();
})

module.exports = router;