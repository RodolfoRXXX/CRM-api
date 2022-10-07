const fs = require("fs");
const Jimp = require("jimp");

async function save_image( imagen, id, id_autor, tabla){
    try {
        let i = 1;
        let base64Image = imagen.split(';base64,').pop();
        let nombre = id_autor + '-' + tabla + '-' + id + '-thumbnail';
        while(fs.existsSync('./public/uploads/' + nombre + '-' + i + '.' + (imagen.split(';base64,')[0]).split('/')[1])){
            i++;
        }
        nombre = nombre + '-' + i + '.' + (imagen.split(';base64,')[0]).split('/')[1]
        let ruta = './public/uploads/' + nombre;
        let buff = Buffer.from(base64Image, 'base64');     
        const image = await Jimp.read(buff);
                      await image.cover(350, 350, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER);
                      await image.quality(95);
                      await image.writeAsync( ruta );
        return nombre;
    } catch (error) {
        console.error(error);
        return 'error';
    }
    
}

module.exports = save_image;