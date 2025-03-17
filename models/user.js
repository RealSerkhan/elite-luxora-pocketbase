import { generateImageUrl } from "../utils/image_helper.js";
import BaseModel from "./base_model.js";

class User extends BaseModel {
    constructor(data) {
        super(data); // ✅ Inherit `id`, `created_at`, `updated_at` from BaseModel

        this.name = data.name;
        this.surname = data.surname;
        this.email = data.email;
        this.email_visibility = data.emailVisibility;
        this.verified = data.verified;
        this.avatar =  generateImageUrl(data.collectionId, data.id, data.avatar);
        this.collection_id = data.collectionId;
        this.collection_name = data.collectionName;

        
    }
}
export default User;