const express = require('express');
const router  = express.Router();
const app = express();
const keys = require('../settings/keys');
const cors = require('cors');
const bodyParser = require('body-parser');
const configmensaje = require('./configmensaje');
const connection = require('../settings/connection');
const nodemailer = require('nodemailer');

app.use(bodyParser.json());
app.use(cors());

const md5     = require('md5');
const jwt     = require('jsonwebtoken');
const { restart } = require('nodemon');

//Registra un usuario nuevo
router.post('/register', async function(req, res, next){
    try{
        let {name, email, password, role, thumbnail, id_enterprise, activation_code, state} = req.body;

        let name_enterprise;
        const sql_e = `SELECT * FROM enterprise WHERE id = ?;`
        connection.con.query(sql_e, id_enterprise, (err, result, fields) => {
            if (err) {
                //error para encontrar la empresa
                res.send({status: 0, data: err});
            } else {
                //Empresa encontrada y guardada en una variable temporal
                name_enterprise = result[0].name
            }
        })

        const hashed_password = md5(password.toString())
        const checkEmail = `SELECT email FROM users WHERE email = ?`;
        connection.con.query(checkEmail, [email], (err, result, fields) => {
            if (!result.length) {
                //éxito en no encontrar usuario registrado
                const sql = `INSERT INTO users (name, email, password, role, thumbnail, id_enterprise, activation_code, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                connection.con.query(sql, [name, email, hashed_password, role, thumbnail, id_enterprise, activation_code, state], (err, result, fields) => {
                    if (err) {
                        //error de conexion o para agregar el usuario
                        res.send({status: 0, data: err});
                    } else {
                        let user = [{id: result.insertId, name: name, email: email, password: hashed_password, role: role, thumbnail: thumbnail, enterprise: name_enterprise, activation_code: activation_code, state: state}]
                        //éxito al agregar el usuario
                        let token = jwt.sign({data: user}, keys.key);
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
    connection.con.end;
});

//Comprueba las credenciales de usuario y dá acceso
router.post('/login', async function(req, res, next){
    try {
        let {email, password} = req.body;
        const hashed_password = md5(password.toString())
        const sql = `SELECT users.id, users.name, email, password, role, thumbnail, enterprise.name AS enterprise, activation_code, state FROM users INNER JOIN enterprise ON users.id_enterprise = enterprise.id WHERE email = ? AND password = ?`
        connection.con.query(sql, [email, hashed_password], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(result.length){
                    let token = jwt.sign({data: result}, keys.key);
                    res.send({status: 1, data: result, token: token});
                } else{
                    res.send({status: 1, data: ''});
                }
            }
        })
    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Comprueba las credenciales de usuario y dá acceso
router.post('/recharge', async function(req, res, next){
    try {
        let {email, password} = req.body;
        const sql = `SELECT users.id, users.name, email, password, role, thumbnail, enterprise.name AS enterprise, activation_code, state FROM users INNER JOIN enterprise ON users.id_enterprise = enterprise.id WHERE email = ? AND password = ?`
        connection.con.query(sql, [email, password], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(result.length){
                    let token = jwt.sign({data: result}, keys.key);
                    res.send({status: 1, data: result, token: token});
                } else{
                    res.send({status: 1, data: ''});
                }
            }
        })
    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Verifica que el correo electrónico pertenezca a una cuenta y devuelve su información
router.post('/verificate-email', async function(req, res, next){
    try{
        let {email} = req.body;

        const checkEmail = `SELECT * FROM users WHERE email = ?`;
        connection.con.query(checkEmail, email, (err, result, fields) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if (result.length) {
                    //Se encontró el correo electrónico
                    res.send({status: 1, data: result});
                } else{
                    //No encontró el correo electrónico
                    res.send({status: 1, data: ''});
                }
            }
        });
    } catch(error){
        //error de conexión
        res.send({status: 0, data: error});
    }
    connection.con.end;
});

//Activa la cuenta bloqueada por código de activación
router.post('/verificate-code', async function(req, res, next){
    try{
        let {email, activation_code} = req.body;

        const checkCode = `SELECT * FROM users WHERE email = ? AND activation_code = ?`;
        connection.con.query(checkCode, [email, activation_code], (err, result, fields) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(result.length){
                    const activate = `UPDATE users SET state = 1 WHERE id = ?`;
                    connection.con.query(activate, result[0].id, (err, result, fields) => {
                        if (err) {
                            res.send({status: 0, data: err});
                        } else{
                            res.send({status: 1, data: result});
                        }
                    });
                } else{
                    res.send({status: 1, data: ''});
                }
            }
        });
    } catch(error){
        //error de conexión
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Devuelve el listado de empresas de la tabla Enterprises
router.get('/get-enterprise', async function(req, res, next){
    try{
        const getEnterprise = `SELECT * FROM enterprise`;
        connection.con.query(getEnterprise, (err, result, fields) => {
            if(err){
                res.send({status: 0, data: err});
            } else{
                if (result.length) {
                    //Devuelve el listado
                    res.send({status: 1, data: result});
                } else{
                    //No encontró el listado
                    res.send({status: 1, data: ''});
                }
            }
        });
    } catch(error){
        //error de conexión
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Envio de email
router.post('/envio-email', async function(req, res){
    try {
        configmensaje.email_body.to = req.body.email;
        configmensaje.data = req.body.data;
        switch (req.body.tipo) {
            case 'register':
                configmensaje.email_body.subject = 'Bienvenido a - Bamboo! -';
                configmensaje.email_body.html = configmensaje.body.html_initial + configmensaje.email_body.subject + configmensaje.body.html_middle + configmensaje.plantilla_register.pr1 + configmensaje.data + configmensaje.plantilla_register.pr2 + configmensaje.body.html_final;
                break;
            case 'code':
                configmensaje.email_body.subject = 'Código de verificación';
                configmensaje.email_body.html = configmensaje.body.html_initial + configmensaje.email_body.subject + configmensaje.body.html_middle + configmensaje.plantilla_code.pc1 + configmensaje.data + configmensaje.plantilla_code.pc2 + configmensaje.body.html_final;
                break;
            case 'change_pass':
                configmensaje.email_body.subject = 'Actualización de tu cuenta';
                configmensaje.email_body.html = configmensaje.body.html_initial + configmensaje.email_body.subject + configmensaje.body.html_middle + configmensaje.plantilla_change_pass + configmensaje.body.html_final;
                break;
            case 'change_mail':
                configmensaje.email_body.subject = 'Actualización de tu cuenta';
                configmensaje.email_body.html = configmensaje.body.html_initial + configmensaje.email_body.subject + configmensaje.body.html_middle + configmensaje.plantilla_change_mail.pcm1 + configmensaje.data + configmensaje.plantilla_change_mail.pcm2 + configmensaje.body.html_final;
                break;
            case 'change_user':
                configmensaje.email_body.subject = 'Actualización de tu cuenta';
                configmensaje.email_body.html = configmensaje.body.html_initial + configmensaje.email_body.subject + configmensaje.body.html_middle + configmensaje.plantilla_change_user + configmensaje.body.html_final;
                break;
            /*case 'message':
                configmensaje.email_body.subject = 'Mensaje de usuario';
                configmensaje.title = 'Mensaje de usuario';
                configmensaje.body = configmensaje.plantilla_message;
                break;*/
        }
        let transport = nodemailer.createTransport(configmensaje.jConfig);

        transport.sendMail(configmensaje.email_body, function (error, info) {
            (error)?res.send({status: 1, data: 'nok'}):res.send({status: 1, data: 'ok'});
            transport.close();
        });
    } catch (error) {
        //error de conexión
        res.send({status: 0, data: error});
    }
    connection.con.end;
})

//Actualiza la contraseña del usuario
router.put('/restore-password', async function(req, res, next){
    try {
        let {email, id, password} = req.body;

        const hashed_password = md5(password.toString())
        const sql = `UPDATE users SET password = ? WHERE id = ?`;
        connection.con.query(sql, [hashed_password, id, email], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                res.send({status: 1, data: result});
            }
        })
    } catch (error) {
        console.log(error)
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

module.exports = router;