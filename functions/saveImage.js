const fs = require("fs");
const Jimp = require("jimp");
//id, image

// imagen, id, id_autor, tabla
async function save_image(id, type, image, blanck){
    try {
        let base64Image = image.split(';base64,').pop();
        let name_image = id + '-' + type + '-thumbnail';
        name_image = name_image + '.' + (image.split(';base64,')[0]).split('/')[1]
        let route = './public/uploads/' + name_image;

        if(!blanck) {
            //Busca el archivo existente y lo elimina
            if(fs.existsSync(route)) {
                fs.unlink(route, (err) => {
                    if(err) {
                        throw 'error'
                    }
                });
            }
        }
            let buff = Buffer.from(base64Image, 'base64');     
            const image_def = await Jimp.read(buff);
                                await image_def.cover(350, 350, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
                                await image_def.quality(95);
                                await image_def.writeAsync(route);
            return name_image
    } catch (error) {
        return error;
    }
}

module.exports = save_image;