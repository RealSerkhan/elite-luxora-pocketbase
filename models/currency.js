import BaseModel from './base_model.js';

class Currency extends BaseModel {
    constructor(data, lang = "en") {
        super(data);
        
        // ✅ Localized Name
        this.name = data[`name_${lang}`] || data.name_en;
        
        // ✅ Image Link
        this.image_link = data.image_link || "";
    }
}

export default Currency;