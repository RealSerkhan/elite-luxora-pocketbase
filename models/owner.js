import { generateImageUrl } from '../utils/image_helper.js';
import BaseModel from './base_model.js';

class Owner extends BaseModel {
    constructor(data) {
        super(data);
        
        // ✅  Name
        this.name = data.name;
        
        // ✅ Image Link
        this.image_link = generateImageUrl(data.collectionId, data.id, data.image_link);
        
    }
}

export default Owner;