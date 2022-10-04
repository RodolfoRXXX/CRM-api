const fs = require("fs");
const Jimp = require("jimp");

async function save_image( imagen, nombre){
    let base64Image = imagen.split(';base64,').pop();
    nombre = nombre + '-thumbnail.' + (imagen.split(';base64,')[0]).split('/')[1];
    let buff = Buffer.from(base64Image, 'base64');
        const image = await Jimp.read(buff);
                      await image.cover(350, 350, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER);
                      await image.quality(95);
                      await image.writeAsync('uploads/' + nombre )
            return nombre;
}

module.exports = save_image;