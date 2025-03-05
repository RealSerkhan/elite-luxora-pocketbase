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

        this.image_link = data.image_link || "";
    }
}

export default Agent;