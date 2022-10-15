const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const app     = express();
const keys    = require('../settings/keys');
const path = require('path');
const cors = require('cors');
const fs = require("fs");
const Jimp = require("jimp");

app.set('keys', keys.key);

const md5     = require('md5');
const jwt     = require('jsonwebtoken');
const mysql   = require('mysql');
const save_image = require('../functions/saveImage');

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

//Obtiene todos los tags de un usuario
router.post('/get-all-tag', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, tabla} = req.body;
        const sql = `SELECT * FROM ${tabla} WHERE id_autor = ?`;
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

//Obtiene el tag elegido para ver/modificar/vincular
router.post('/get-tag', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, tabla} = req.body;
        const sql = `SELECT * FROM ${tabla} WHERE id = ?`;
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

//Crea un nuevo Tag
router.post('/create-tag', auth.verifyToken, async (req, res, next) => {
    let data = {};
    try {
        if(req.body.tabla != ''){
            data = req.body;
        } else{
            throw 'Tabla no definida';
        }
        if(data.foto.includes(';base64,')){
            await save_image(data.foto, data.id, data.id_autor, data.tabla)
            .then( ruta_imagen => {
                if(ruta_imagen == 'error') throw 'error';
                data.foto = ruta_imagen;
            } )
            .catch( error => {
                throw error;
            } )
        }
        let arr_fields = [];
        let arr_values = [];
        Object.entries(data).map( element => {
            if((element[0] != 'tabla')&&(element[0] != 'id')){
                if(element[0] == 'id_autor'){
                    arr_fields.push('`' + element[0] + '`');
                    arr_values.push(element[1]);
                } else{
                    arr_fields.push('`' + element[0] + '`');
                    arr_values.push('\'' + element[1] + '\'');
                }
            }
        } )
        let fields = arr_fields.join();
        let values = arr_values.join();
        const sql = `INSERT INTO ${data.tabla} (${fields}) VALUES (${values})`;
        con.query(sql, (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                res.send({status: 1, data: result});
            }
        })
        //res.send({status: 1, data: fields, data1: values});

    } catch (error) {
        console.error(error);
        res.send({status: 0, data: error});
    }
});

//Edita un Tag existente
router.put('/edit-tag', auth.verifyToken, async (req, res, next) => {
    let data = {};
    try {
        if(req.body.tabla != ''){
            data = req.body;
        } else{
            throw 'Tabla no definida';
        }
        if(data.foto.includes(';base64,')){
            await save_image(data.foto, data.id, data.id_autor, data.tabla)
            .then( ruta_imagen => {
                if(ruta_imagen == 'error') throw 'error';
                data.foto = ruta_imagen;
            } )
            .catch( error => {
                throw error;
            } )
        }
        let arr = [];
        Object.entries(data).map( element => {
            if(element[0] != 'tabla'){
                if((element[0] == 'id')||(element[0] == 'id_autor')){
                    arr.push('`' + element[0] + '`=' + element[1]);
                } else{
                    arr.push('`' + element[0] + '`=\'' + element[1] + '\'');
                }
            }
        } )
        let datos = arr.join();
        const sql = `UPDATE ${data.tabla} SET ${datos} WHERE id = ?`
        con.query(sql, [data.id], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                res.send({status: 1, data: result});
            }
        })

    } catch (error) {
        console.error(error);
        res.send({status: 0, data: error});
    }
});

//Busca el QR vinculado de un registro
router.post('/get-tag-link', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, tabla} = req.body;
        const sql = `SELECT * FROM ${tabla} WHERE id = ?`;
        con.query(sql, id, (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(result[0].id_qr == 0){
                    res.send({status: 1, data: 'nolink'});
                } else{
                    const sql_qr = `SELECT * FROM tablaqr WHERE id = ?`;
                    con.query(sql_qr, result[0].id_qr, (err, result, field) => {
                    if (err) {
                        res.send({status: 0, data: err});
                    } else {
                        res.send({status: 1, data: result});
                    }
                })
                }                
            }
        })

    } catch (error) {
        res.send({status: 0, error: error});
    }
});

//Linkea un tag_qr con un tag_id
    //Vincular
        //(SELECT tablaqr) se debe comprobar que el código existe en tablaqr
        //si existe, devuelve el registro / si no existe, devuelve que no existe
        //(UPDATE personas/mascotas/vehiculos) el id del registro se actualiza en el registro de personas, mascotas o vehiculos
        //(UPDATE tablaqr) se actualiza el tipo(personas, mascotas o vehiculos) de ese registro en tablaqr
router.post('/update-tag-link', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, codigo, tabla} = req.body;
        const sql = `SELECT * FROM tablaqr WHERE codigo = ?`;
        con.query(sql, codigo, (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(!result.length){
                    res.send({status: 1, data: 'codigo inexistente'});
                } else{
                    let id_qr = result[0].id;
                    const sql_update = `UPDATE ${tabla} SET id_qr = ?, estado = ? WHERE id = ?`;
                    con.query(sql_update, [id_qr, 'link', parseInt(id)], (err, result, field) => {
                        if (err) {
                            res.send({status: 0, data: err});
                        } else {
                            if(result.affectedRows == 0){
                                res.send({status: 0, data: 'id_qr no modificado'});
                            } else{
                                const sql_update_qr = `UPDATE tablaqr SET tipo = ? WHERE id = ?`;
                                con.query(sql_update_qr, [tabla, id_qr], (err, result, field) => {
                                    if (err) {
                                        res.send({status: 0, data: err});
                                    } else {
                                        if(result.affectedRows == 0){
                                            res.send({status: 0, data: 'tipo en tablaqr no actualizado'});
                                        } else{
                                            res.send({status: 1, data: result})
                                        }
                                    }
                                })
                            }
                        }
                })
                }                
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