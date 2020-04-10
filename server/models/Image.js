const sharp = require('sharp');

class ImageModel{

    constructor(buffer,maxWidth = 250, maxHeight = 250, maxSizeBytes = 50 * Math.pow(2,20) ){
        if(buffer.byteLength > maxSizeBytes){
            throw new Error("Provided image is too large.");
        }
        this.image = sharp(buffer);
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        
      
    }

    async toPng(){
       const meta = await this.image.metadata();
       

        if(meta.width > this.maxWidth || meta.height.size > this.maxHeight){
            const options = {
                width: this.maxWidth,
                height: this.maxHeight,
                fit: 'inside'                

            };
            this.image = await this.image.resize(options);
        }

        return this.image.png().toBuffer();
        
        
    }

    /**
     * Static helper to streamline async and sync methods calls into
     * pure aync
     * @param {Buffer} buffer 
     */
    static async bufferToPng(buffer){
        try{
            const image = new ImageModel(buffer);
            return image.toPng();
        }
        catch(e){
            return Promise.reject(e);
        }
    }
}

module.exports.ImageModel = ImageModel;