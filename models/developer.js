import { generateImageUrl } from '../utils/image_helper.js';
import BaseModel from './base_model.js';

class Developer extends BaseModel {
    constructor(data, lang = "en") {
        super(data);
        
        // ✅ Localized Name
        this.name = data[`name_${lang}`] || data.name_en;

        this.image_link = generateImageUrl(data.collectionId, data.id, data.image_link);

        this.whatsapp=data.whatsapp;
        this.phone_number=data.phone_number;
        this.email=data.email;
        
    }
}

export default Developer;