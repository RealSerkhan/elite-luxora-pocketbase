import { generateImageUrl } from '../utils/image_helper.js';
import Area from './area.js';
import BaseModel from './base_model.js';

class Agent extends BaseModel {
    constructor(data, lang = 'en') {
        super(data);

        this.name = data.name;

        this.languages = data.languages || [];

        this.phone_number = data.phone_number;

        this.experience_since = data.experience_since;

        this.dubai_broker_license = data.dubai_broker_license;

        this.about = data[`about${lang}`] || data.about_en;

        // ✅ Image Link
        this.image_link = generateImageUrl(data.collectionId, data.id, data.image_link);
        this.sales_count = data.sales_count;
        this.rents_count = data.rents_count;
        this.areas = data.expand?.area_ids?.map(area => new Area(area, lang)) || data.area_ids || [];
        this.closed_deals_count = data.closed_deals_count;
        this.closed_sales_count = data.closed_sales_count;
        this.closed_rent_count = data.closed_rent_count;
        this.total_sales_amount = data.total_sales_amount;
        this.total_rent_amount = data.total_rent_amount;
        this.deals = data.closed_deals





    }
}

export default Agent;