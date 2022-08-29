const express = require('express');
const indexRouter = require('./routes/index');
const cors = require('cors');

const app = express();
app.use(cors())
app.use(express.json());
app.use('/', indexRouter);

app.listen(4000, () => {
    console.log('Escuchando en el puerto 4000');
})

//Esto es un cambio para que se guarde en la rama "secondary"
