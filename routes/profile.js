const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/profile', auth.verifyToken, async (req, res) => {
    //Aquí puede retornar información desde la base de datos, ahora devuelve info cualquiera

    res.send({status: 1, data:{username: "Rodolfo", userWebsite: "https://www.google.com", message: "Successful"}})
});

module.exports = router;