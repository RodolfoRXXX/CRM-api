const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const app     = express();
const keys    = require('../settings/keys');
const path = require('path');
const cors = require('cors');
const fs = require("fs");
const Jimp = require("jimp");
const connection = require('../settings/connection');

const md5     = require('md5');
const jwt     = require('jsonwebtoken');
const save_image = require('../functions/saveImage');

//Desbloquea la cuenta del usuario cundo se ingresa el código de activación asignado a dicha cuenta
router.post('/verificate-user', async function(req, res, next){
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

//Actualiza la contraseña del usuario
router.put('/update-password', auth.verifyToken, async function(req, res, next){
    try {
        let {id, password} = req.body;

        const hashed_password = md5(password.toString())
        const sql = `UPDATE users SET password = ? WHERE id = ?`;
        connection.con.query(sql, [hashed_password, id], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                let token = jwt.sign({data: result}, keys.key)
                res.send({status: 1, data: result, token: token});
            }
        })

    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Actualiza el correo electrónico del usuario
router.put('/update-email', auth.verifyToken, async function(req, res, next){
    try {
        let {id, email, codeEmail, active} = req.body;

        const sql = `UPDATE users SET email = ?, codeEmail = ?, active = ? WHERE id = ?`;
        connection.con.query(sql, [email, codeEmail, active, id], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                let token = jwt.sign({data: result}, keys.key)
                res.send({status: 1, data: result, token: token});
            }
        })

    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Actualiza el nombre de usuario
router.put('/update-username', auth.verifyToken, async function(req, res, next){
    try {
        let {id, nombre} = req.body;

        const sql = `UPDATE users SET nombre = ? WHERE id = ?`;
        connection.con.query(sql, [nombre, id], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                let token = jwt.sign({data: result}, keys.key)
                res.send({status: 1, data: result, token: token});
            }
        })

    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Obtiene todos los tags de un usuario
router.post('/get-all-tag', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, tabla} = req.body;
        const sql = `SELECT * FROM ${tabla} WHERE id_autor = ?`;
        connection.con.query(sql, id, (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                res.send({status: 1, data: result});
            }
        })

    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Obtiene el tag elegido para ver/modificar/vincular
router.post('/get-tag', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, tabla} = req.body;
        const sql = `SELECT * FROM ${tabla} WHERE id = ?`;
        connection.con.query(sql, id, (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                res.send({status: 1, data: result});
            }
        })

    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
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
        connection.con.query(sql, (err, result, field) => {
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
    connection.con.end;
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
        connection.con.query(sql, [data.id], (err, result, field) => {
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
    connection.con.end;
});

//Busca el QR vinculado de un registro
router.post('/get-tag-link', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, tabla} = req.body;
        const sql = `SELECT * FROM ${tabla} WHERE id = ?`;
        connection.con.query(sql, id, (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(result[0].id_qr == 0){
                    res.send({status: 1, data: 'nolink'});
                } else{
                    const sql_qr = `SELECT * FROM tablaqr WHERE id = ?`;
                    connection.con.query(sql_qr, result[0].id_qr, (err, result, field) => {
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
    connection.con.end;
});

//Linkea un tag_qr con un tag_id
    //Vincular
router.put('/update-tag-link', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, codigo, tabla} = req.body;
        const sql = `SELECT * FROM tablaqr WHERE codigo = ?`;
        connection.con.query(sql, codigo, (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(!result.length){
                    res.send({status: 0, data: 'codigo inexistente'});
                } else{
                    let id_qr = result[0].id;
                    const sql_update = `UPDATE ${tabla} SET id_qr = ?, estado = ? WHERE id = ?`;
                    connection.con.query(sql_update, [id_qr, 'link', parseInt(id)], (err, result, field) => {
                        if (err) {
                            res.send({status: 0, data: err});
                        } else {
                            if(result.affectedRows == 0){
                                res.send({status: 0, data: 'id_qr no modificado'});
                            } else{
                                const sql_update_qr = `UPDATE tablaqr SET tipo = ? WHERE id = ?`;
                                connection.con.query(sql_update_qr, [tabla, id_qr], (err, result, field) => {
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
    connection.con.end;
});

//Linkea un tag_qr con un tag_id
    //Desvincular
router.put('/update-tag-unlink', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, codigo, tabla} = req.body;
        const sql = `SELECT * FROM tablaqr WHERE codigo = ?`;
        connection.con.query(sql, codigo, (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(!result.length){
                    res.send({status: 1, data: 'codigo inexistente'});
                } else{
                    let id_qr = result[0].id;
                    const sql_update = `UPDATE ${tabla} SET id_qr = 0, estado = 'nolink' WHERE id = ?`;
                    connection.con.query(sql_update, parseInt(id), (err, result, field) => {
                        if (err) {
                            res.send({status: 0, data: err});
                        } else {
                            if(result.affectedRows == 0){
                                res.send({status: 0, data: 'id_qr no eliminado'});
                            } else{
                                const sql_update_qr = `UPDATE tablaqr SET tipo = '' WHERE id = ?`;
                                connection.con.query(sql_update_qr, id_qr, (err, result, field) => {
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
    connection.con.end;
});

//Obtener el estado de alerta de un tag
router.post('/get-tag-alert', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, tabla} = req.body;
        const sql = `SELECT estado, obsestado, fechaestado FROM ${tabla} WHERE id = ?`;
        connection.con.query(sql, id, (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                res.send({status: 1, data:result});
            }                
        })
    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Crear un alerta sobre un tag
router.put('/create-tag-alert', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, obsestado, fechaestado, tabla} = req.body;
        const sql = `UPDATE ${tabla} SET estado = ?, obsestado = ?, fechaestado = ? WHERE id = ?`;
        connection.con.query(sql, ['alert', obsestado, fechaestado, id], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(result.affectedRows == 0){
                    res.send({status: 0, data: 'error'});
                } else{
                    res.send({status: 1, data: 'ok'})
                }
            }                
        })
    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Editar un alerta sobre un tag
router.put('/edit-tag-alert', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, obsestado, fechaestado, tabla} = req.body;
        const sql = `UPDATE ${tabla} SET obsestado = ? WHERE id = ?`;
        connection.con.query(sql, [obsestado, id], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(result.affectedRows == 0){
                    res.send({status: 0, data: 'error'});
                } else{
                    res.send({status: 1, data: 'ok'})
                }
            }                
        })
    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Eliminar un alerta sobre un tag
router.put('/delete-tag-alert', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, tipo} = req.body;
        const sql = `UPDATE ${tipo} SET estado = ?, obsestado = '', fechaestado = '' WHERE id = ?`;
        connection.con.query(sql, ['link', id], (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(result.affectedRows == 0){
                    res.send({status: 0, data: 'error'});
                } else{
                    res.send({status: 1, data: 'ok'})
                }
            }                
        })
    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Eliminar un tag
router.post('/delete-tag', auth.verifyToken, async (req, res, next) => {
    try {
        let {id, tabla} = req.body;
        const sql_data = `SELECT * FROM ${tabla} WHERE id = ?`;
        connection.con.query(sql_data, id, (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(fs.existsSync('./public/uploads/' + result[0].foto)){
                    fs.unlinkSync('./public/uploads/' + result[0].foto);
                }
                const sql = `DELETE FROM ${tabla} WHERE id = ?`;
                connection.con.query(sql, id, (err, result, field) => {
                    if (err) {
                        res.send({status: 0, data: err});
                    } else {
                        res.send({status: 1, data:result});
                    }                
                })
            }                
        })
    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Obtiene la suma de todos los tags para el dashboard
router.post('/get-data-card', auth.verifyToken, async (req, res, next) => {
    try {
        let {id} = req.body;
        let creados = [];
        let link = [];
        let nolink = [];
        let alert = [];
        const sql_personas = `SELECT * FROM personas WHERE id_autor = ?`;
        connection.con.query(sql_personas, id, (err, result, field) => {
            if (err) {
                res.send({status: 0, data: err});
            } else {
                if(result.length){
                    result.forEach(element => {
                        creados.push(element);
                        if(element.estado == 'link'){
                            link.push(element);
                        } else if(element.estado == 'nolink'){
                            nolink.push(element);
                        } else{
                            alert.push(element);
                        }
                    });
                }
                const sql_mascotas = `SELECT * FROM mascotas WHERE id_autor = ?`;
                connection.con.query(sql_mascotas, id, (err, result, field) => {
                    if (err) {
                        res.send({status: 0, data: err});
                    } else {
                        if(result.length){
                            result.forEach(element => {
                                creados.push(element);
                                if(element.estado == 'link'){
                                    link.push(element);
                                } else if(element.estado == 'nolink'){
                                    nolink.push(element);
                                } else{
                                    alert.push(element);
                                }
                            });
                        }
                        const sql_vehiculos = `SELECT * FROM vehiculos WHERE id_autor = ?`;
                        connection.con.query(sql_vehiculos, id, (err, result, field) => {
                            if (err) {
                                res.send({status: 0, data: err});
                            } else {
                                if(result.length){
                                    result.forEach(element => {
                                        creados.push(element);
                                        if(element.estado == 'link'){
                                            link.push(element);
                                        } else if(element.estado == 'nolink'){
                                            nolink.push(element);
                                        } else{
                                            alert.push(element);
                                        }
                                    });
                                }
                                total = link + nolink + alert;
                                res.send({status: 1, data:{creados:creados, link:link, nolink:nolink, alert:alert}});
                            }
                        })
                    }
                })
            }
        })

    } catch (error) {
        res.send({status: 0, error: error});
    }
    connection.con.end;
});

//Obtiene todos los tags en alerta de un usuario, pero que han sido encontrados
router.post('/get-found-tag', auth.verifyToken, async function(req, res, next){
    try{
        let {id} = req.body;
        let personas = [];
        let mascotas = [];
        let vehiculos = [];
        let array = [];
        let tag = {id:null, titulo:null, obs:null, latitud:null, longitud:null, fecha:null};
        const sql_personas = `SELECT * FROM personas WHERE estado = 'alert' AND position != '' AND id_autor = ?`;
        connection.con.query(sql_personas, id, (err, result, fields) => {
            if(err){
                res.send({status: 0, error: err});
            } else{
                if(result.length){
                    personas.push(...result);
                }
                const sql_mascotas = `SELECT * FROM mascotas WHERE estado = 'alert' AND position != '' AND id_autor = ?`;
                connection.con.query(sql_mascotas, id, (err, result, fields) => {
                    if(err){
                        res.send({status: 0, error: err});
                    } else{
                        if(result.length){
                            mascotas.push(...result);
                        }
                        const sql_vehiculos = `SELECT * FROM vehiculos WHERE estado = 'alert' AND position != '' AND id_autor = ?`;
                        connection.con.query(sql_vehiculos, id, (err, result, fields) => {
                            if(err){
                                res.send({status: 0, error: err});
                            } else{
                                if(result.length){
                                    vehiculos.push(...result);
                                }
                                let i = 0;
                                personas.forEach( element => {
                                    tag.id = i;
                                    tag.titulo = element.nombre + ' ' + element.apellido;
                                    tag.obs = element.obsestado;
                                    tag.latitud = JSON.parse(element.position).latitud;
                                    tag.longitud = JSON.parse(element.position).longitud;
                                    tag.fecha = JSON.parse(element.position).fecha;
                                    array[i] = tag;
                                    i++;
                                } )
                                tag = {id:null, titulo:null, obs:null, latitud:null, longitud:null, fecha:null}
                                mascotas.forEach( element => {
                                    tag.id = i;
                                    tag.titulo = element.especie + ' - ' + element.nombre;
                                    tag.obs = element.obsestado;
                                    tag.latitud = JSON.parse(element.position).latitud;
                                    tag.longitud = JSON.parse(element.position).longitud;
                                    tag.fecha = JSON.parse(element.position).fecha;
                                    array[i] = tag;
                                    i++;
                                } )
                                tag = {id:null, titulo:null, obs:null, latitud:null, longitud:null, fecha:null}
                                vehiculos.forEach( element => {
                                    tag.id = i;
                                    tag.titulo = element.marca + ' - ' + element.modelo + ' - ' + element.color;
                                    tag.obs = element.obsestado;
                                    tag.latitud = JSON.parse(element.position).latitud;
                                    tag.longitud = JSON.parse(element.position).longitud;
                                    tag.fecha = JSON.parse(element.position).fecha;
                                    array[i] = tag;
                                    i++;
                                } )
                                res.send({status: 1, data: array});
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
    connection.con.end;
})

module.exports = router;