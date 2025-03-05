class BaseModel {
    constructor(data) {
        this.id = data.id;
        this.created_at = data.created || null;
        this.updated_at = data.updated || null;
    }
}

export default BaseModel;