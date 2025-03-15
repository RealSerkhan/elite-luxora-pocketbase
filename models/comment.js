import { generateImageUrl } from '../utils/image_helper.js';
import BaseModel from './base_model.js';


class Comment extends BaseModel {
    constructor(data, lang = "en") {
        super(data);

        // ✅ Localized Name
        this.name = data.name;

        this.comment = data.comment;

        // ✅ Image Link
        this.image_link = generateImageUrl(data.collectionId, data.id, data.image_link);

        // ✅ Image Link
        this.comment_source_image = generateImageUrl(data.collectionId, data.id, data.comment_source_image);
    }
}

export default Comment;