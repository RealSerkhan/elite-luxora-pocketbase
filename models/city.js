import { generateImageUrl } from '../utils/image_helper.js';
import BaseModel from './base_model.js';

class City extends BaseModel {
    constructor(data, lang = "en") {
        super(data);
        
        // ✅ Localized Name
        this.name = data[`name_${lang}`] || data.name_en;
        
        // ✅ Image Link
        this.image_link = generateImageUrl(data.collectionId, data.id, data.image_link);
    }
}

export default City;