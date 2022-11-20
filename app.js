const express = require('express');
const indexRouter = require('./routes/index');
const port = process.env.PORT || 4000;
const path = require('path');
const cors = require('cors');
const fs = require("fs")

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

/*app.get('/prueba', (req, res, next) => {
    res.send('Exito');
});*/

//Esto es un cambio para que se guarde en la rama "secondary"

app.listen(app.get('port'), (err) => {
    if(err){
        console.log(`Error del servidor: ${err}`);
    } else{
        console.log('Escuchando en el puerto 4000');
    }
    
})