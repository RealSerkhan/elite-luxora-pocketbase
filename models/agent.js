import { generateImageUrl } from '../utils/image_helper.js';
import BaseModel from './base_model.js';

class Agent extends BaseModel {
    constructor(data,lang='en') {
        super(data);
    
        this.name = data.name;

        this.languages = data.languages || [];

        this.phone_number = data.phone_number;

        this.experience_since = data.experience_since;

        this.dubai_broker_license = data.dubai_broker_license;

        this.about = data[`about${lang}`] || data.about_en;

        // ✅ Image Link
        this.image_link = generateImageUrl(data.collectionId, data.id, data.image_link);
    }
}

export default Agent;