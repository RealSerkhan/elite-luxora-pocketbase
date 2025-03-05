/**
 * The base model that all models should extend.
 */
class BaseModel {
    constructor(data) {
        this.id = data.id;
        this.created_at = data.created || null;
        this.updated_at = data.updated || null;
    }

    /**
     * Example: Check if this record is new or existing.
     */
    isNew() {
        return !this.id;
    }
}

export default BaseModel;