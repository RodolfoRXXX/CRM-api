/*const express = require('express');
const indexRouter = require('./routes/index');
const port = process.env.PORT || 4000;
const path = require('path');
const cors = require('cors');
const fs = require("fs");

const http = require('http');
const hostname = '127.0.0.1';

//inicialización
const app = express();
app.use(express.json({limit: '10mb'}));
app.use(express.static('public'));

//setting
app.set('port', port);

//middlewares
app.use(cors({origin: "*"}));
app.use(express.json());

app.use('/', indexRouter);

app.get('/prueba', (req, res, next) => {
    res.send('Exito');
});

//Crea la conexión con express directo
/*
app.listen(app.get('port'), (err) => {
    if(err){
        console.log(`Error del servidor: ${err}`);
    } else{
        console.log('Escuchando en el puerto 4000');
    }

}) */

//Crea el servidor http que llama a app de express
/*
const server = http.createServer(app);
server.listen(app.get('port'), hostname, (err) => {
        if(err){
                console.log(`Error del servidor: ${err}`);
        } else{
                console.log(`Servidor corriendo en http://${hostname}`);
        }
});
*/

/* ----------------------------------------------- */
const express = require('express');
const indexRouter = require('./routes/index');
const port = process.env.PORT || 4000;
const path = require('path');
const cors = require('cors');
const fs = require("fs");

const http = require('http');
const hostname = '127.0.0.1';

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

server.listen(port,hostname, () => {
    console.log(`Servidor corriendo en http://${hostname}`);
});

app.use('/', indexRouter);

app.get('/prueba', (req, res) => {
    res.send('Exito');
});