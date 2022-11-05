const nodemailer = require('nodemailer');

module.exports = (formulario) => {
    let title = '';
    let cuerpo = '';

    let plantilla_register = `
                                <div style="width: 360px; background-color: #fff; border-radius: 10px; margin: 20px 0; box-sizing: border-box; padding: 30px; border: 0.25px solid grey;">
                                    <div style="padding: 10px;">
                                        <p style="font-family: Trebuchet MS, Helvetica; display: block; text-align: center; font-size: 18px; line-height: 20px; margin: auto; ">
                                            Te damos una cordial bienvenida!
                                        </p>
                                    </div>
                                    <div style="text-align: center; margin: 20px 0;">
                                        <h1 style="font-family: Verdana, Arial; margin: auto; background-color: #EEEEEE; padding: 10px;border-radius: 10px; word-break: break-word; " >${formulario.data.codigo}</h1>
                                    </div>
                                    <div style="padding: 12px 10px; ">
                                        <p style="font-family: Trebuchet MS, Helvetica; display: block; text-align: center; font-size: 16px; line-height: 18px; margin: auto; ">
                                            Este es tu código de verificación, ingresalo en tu cuenta para verificarla y poder acceder a todas sus funcionalidades.
                                        </p>
                                    </div>
                                </div>
                            `;

    let plantilla_verificate = `
                                <div style="width: 360px; background-color: #fff; border-radius: 10px; margin: 20px 0; box-sizing: border-box; padding: 30px; border: 0.25px solid grey;">
                                    <div style="padding: 10px;">
                                        <p style="font-family: Trebuchet MS, Helvetica; display: block; text-align: center; font-size: 18px; line-height: 20px; margin: auto; ">
                                            Este es tu código de verificación de cuenta
                                        </p>
                                    </div>
                                    <div style="text-align: center; margin: 20px 0;">
                                        <h1 style="font-family: Verdana, Arial; margin: auto; background-color: #EEEEEE; padding: 10px;border-radius: 10px; word-break: break-word; " >${formulario.data.codigo}</h1>
                                    </div>
                                    <div style="padding: 12px 10px; ">
                                        <p style="font-family: Trebuchet MS, Helvetica; display: block; text-align: center; font-size: 16px; line-height: 18px; margin: auto; ">
                                            Copialo y escribilo en tu cuenta para activarla.
                                        </p>
                                    </div>
                                </div>
                            `;

    let plantilla_marker = `
                                <div style="width: 360px; background-color: #fff; border-radius: 10px; margin: 20px 0; box-sizing: border-box; padding: 30px; border: 0.25px solid grey;">
                                    <div style="padding: 10px;">
                                        <p style="font-family: Trebuchet MS, Helvetica; display: block; text-align: center; font-size: 18px; line-height: 20px; margin: auto; ">
                                            Alguien encontró tu tag en alerta
                                        </p>
                                    </div>
                                    <div style="text-align: center; margin: 20px 0; ">
                                        <a style="font-family: Verdana, Arial;  text-align: center; padding: 10px; border-radius: 10px; background: rgb(13, 110, 253); text-decoration: none; color: #fff;" href="${formulario.data.web}" title="Mi cuenta">Ir a mi cuenta</a>
                                    </div>
                                    <div style="padding: 12px 10px; ">
                                        <p style="font-family: Trebuchet MS, Helvetica; display: block; text-align: center; font-size: 16px; line-height: 18px; margin: auto; ">
                                            ingresá a tu cuenta y mirá su ubicación para poder encontrarlo!
                                        </p>
                                    </div>
                                </div>
                            `;

    let plantilla_change_pass = `
                                <div style="width: 360px; background-color: #fff; border-radius: 10px; margin: 20px 0; box-sizing: border-box; padding: 30px; border: 0.25px solid grey;">
                                    <div style="padding: 10px;">
                                        <p style="font-family: Trebuchet MS, Helvetica; display: block; text-align: center; font-size: 18px; line-height: 20px; margin: auto; ">
                                            Ha habido una actualización en tu cuenta
                                        </p>
                                    </div>
                                    <div style="text-align: center; margin: 20px 0;">
                                        <h4 style="font-family: Verdana, Arial;  margin: auto; text-align: center; background: #EEEEEE; padding: 10px;border-radius: 10px;" >- Cambio de contraseña -</h4>
                                    </div>
                                    <div style="padding: 12px 10px; ">
                                        <p style="font-family: Trebuchet MS, Helvetica; display: block; text-align: center; font-size: 16px; line-height: 18px; margin: auto; ">
                                            Si no hiciste ningún cambio, ingresá a tu cuenta para solucionarlo.
                                        </p>
                                    </div>
                                </div>
                            `;

    let plantilla_change_mail = `
                                <div style="width: 360px; background-color: #fff; border-radius: 10px; margin: 20px 0; box-sizing: border-box; padding: 30px; border: 0.25px solid grey;">
                                    <div style="padding: 10px;">
                                        <p style="font-family: Trebuchet MS, Helvetica; display: block; text-align: center; font-size: 18px; line-height: 20px; margin: auto; ">
                                            Ha habido una actualización en tu cuenta
                                        </p>
                                    </div>
                                    <div style="text-align: center; margin: 20px 0;">
                                        <h4 style="font-family: Verdana, Arial;  margin: auto; text-align: center; background: #EEEEEE; padding: 10px;border-radius: 10px;" >- Cambio de correo electrónico -</h4>
                                    </div>
                                    <div style="padding: 12px 10px; ">
                                        <p style="font-family: Trebuchet MS, Helvetica; display: block; text-align: center; font-size: 16px; line-height: 18px; margin: auto; ">
                                            Si no hiciste ningún cambio, ingresá a tu cuenta para solucionarlo.
                                        </p>
                                    </div>
                                </div>
                            `;
                        
    let plantilla_change_user = `
                                <div style="width: 360px; background-color: #fff; border-radius: 10px; margin: 20px 0; box-sizing: border-box; padding: 30px; border: 0.25px solid grey;">
                                    <div style="padding: 10px;">
                                        <p style="font-family: Trebuchet MS, Helvetica; display: block; text-align: center; font-size: 18px; line-height: 20px; margin: auto; ">
                                            Ha habido una actualización en tu cuenta
                                        </p>
                                    </div>
                                    <div style="text-align: center; padding: 10px;">
                                        <h4 style="font-family: Verdana, Arial;  margin: auto; text-align: center; background: #EEEEEE; padding: 10px;border-radius: 10px;" >- Cambio de nombre de usuario -</h4>
                                    </div>
                                    <div style="padding: 12px 10px; ">
                                        <p style="font-family: Trebuchet MS, Helvetica; display: block; text-align: center; font-size: 16px; line-height: 18px; margin: auto; ">
                                            Si no hiciste ningún cambio, ingresá a tu cuenta para solucionarlo.
                                        </p>
                                    </div>
                                </div>
                            `;

    switch (formulario.tipo) {
        case 'register':
            title = 'Bienvenido a - QRlink -!';
            cuerpo = plantilla_register;
            break;
        case 'verificate':
            title = 'Código de verificación';
            cuerpo = plantilla_verificate;
            break;
        case 'marker':
            title = 'Han encontrado tu tag en alerta!';
            cuerpo = plantilla_marker;
            break;
        case 'change_pass':
            title = 'Actualización de tu cuenta';
            cuerpo = plantilla_change_pass;
            break;
        case 'change_mail':
            title = 'Actualización de tu cuenta';
            cuerpo = plantilla_change_mail;
            break;
        case 'change_user':
            title = 'Actualización de tu cuenta';
            cuerpo = plantilla_change_user;
            break;
    }

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
        to:`${formulario.email}`,  //destinatario
        //to:`rodolfo.singular@gmail.com`,
        subject: title,  //asunto del correo
        html:` 
            <table style="margin: auto;">
                <thead>
                    <tr>
                        <th style="width: 360px; height: 75px; ">
                            <div style="background: #fff; margin: 10px 0; box-sizing: border-box; border-top-left-radius: 30px; border-top-right-radius: 30px; border-bottom-left-radius: 30px; border-bottom-right-radius: 30px; padding: 10px 20px; ">
                                <p style="font-family: Trebuchet MS, Helvetica; font-size: 34px; margin: 0; position: relative; top: 7px; line-height: 40px;">qrlink</p>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="width: 360px; height: 75px; background-color: #fff; border-radius: 10px; box-sizing: border-box; border: 0.25px solid grey; padding: 25px 20px;">
                            <h2 style="font-family: Trebuchet MS, Helvetica; margin: 0 10px; text-align: center;">${title}</h2>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            ${cuerpo}
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 360px; height: 110px; background-color: #000; border-radius: 10px; box-sizing: border-box; padding: 40px 60px; text-align: center;">
                            <a style="font-family: Trebuchet MS, Helvetica; color: #fff; text-decoration: none; font-size: 20px; height: 20px;" href="https://www.qrlink.com.ar" title="Ir a qrlink.com.ar">www.qrlink.com.ar</a>
                        </td>
                    </tr>
                </tbody>
            </table>
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