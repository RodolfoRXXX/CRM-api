const nodemailer = require('nodemailer');

module.exports = (formulario) => {
    /*let jConfig = {
        "host":"smtp.gmail.com", 
        "port":465, 
        "secure":true, 
        "auth":{ 
                "type":"login", 
                "user":"rodolfo.singular@gmail.com", 
                "pass":"pnnnzwxpqmqiffeh" 
        }
    };*/

    let jConfig = {
        "host":"mail.qrlink.com.ar", 
        "port":465, 
        "secure":true, 
        "auth":{ 
                "type":"login", 
                "user":"info@qrlink.com.ar", 
                "pass":"ruin876deem012" 
        }
    };

    let email ={ 
        from:"info@qrlink.com.ar",  //remitente
        to:`${formulario.mail}`,  //destinatario
        subject:"Nuevo mensaje de usuario",  //asunto del correo
        html:` 
            <div> 
            <p>Hola amigo</p> 
            <p>Esto es una prueba del vídeo</p> 
            <p>¿Cómo enviar correos eletrónicos con Nodemailer en NodeJS </p> 
            </div> 
        ` 
    };

    let createTransport = nodemailer.createTransport(jConfig);

    createTransport.sendMail(email, function (error, info) { 
        if(error){ 
             console.log("Error al enviar email" + error); 
        } else{ 
             console.log("Correo enviado correctamente"); 
        } 
        createTransport.close(); 
    });
}