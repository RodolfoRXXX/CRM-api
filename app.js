
/* ----------------------------------------------- */
const express = require('express');
const indexRouter = require('./routes/index');
const port = process.env.PORT || 4000;
const path = require('path');
const cors = require('cors');
const fs = require("fs");

const http = require('http');
const hostname = '127.0.0.1';
//const hostname = 'vps-4353411-x.dattaweb.com';

//inicialización
const app = express();
app.use(express.json({limit: '10mb'}));
app.use(express.static('public'));

//setting
app.set('port', port);

//middlewares
app.use(cors({origin: "*"}));
app.use(express.json());

//Crea el server con http y lo vincula con express
const server = http.createServer(app);

/*
//Esto no funciona en el cloud, solo en localhost

server.listen(port,hostname, () => {
    console.log(`Servidor corriendo en http://${hostname} y puerto ${port}`);
});

*/

//Aquí sirve para el cloud, con '0.0.0.0' acepta las peticiones de todas las ips
app.listen(port, '0.0.0.0', () => {
    console.log(`App listening on port ${port}`);
});

app.use('/', indexRouter);

app.get('/prueba', (req, res) => {
    res.send('Exito');
});
