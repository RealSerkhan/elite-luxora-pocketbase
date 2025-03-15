import { generateImageUrls } from '../utils/image_helper.js';
import Agent from './agent.js';
import BaseModel from './base_model.js';
import Category from './category.js';
import Currency from './currency.js';
import Owner from './owner.js';
import Project from './project.js';

class Property extends BaseModel {
    constructor(data, lang = "en") {
        super(data);

        // ✅ Localized Name & Description
        this.name = data[`name_${lang}`] || data.name_en;
        this.description = data[`description_${lang}`] || data.description_en;

        // ✅ Basic Info
        this.price = data.price;
        this.furnishing_status = data.furnishing_status;
        this.is_furnished = !!data.is_furnished;
        this.is_featured = !!data.is_featured;
        this.is_verified = !!data.is_verified;
        this.posted_date = data.posted_date ? new Date(data.posted_date) : null;
        this.delivery_date = data.delivery_date ? new Date(data.delivery_date) : null;
        this.property_type = data.property_type;


        // ✅ Currency (Relation)
        this.currency = data.expand?.currency_id ? new Currency(data.expand?.currency_id, lang) : { id: data.currency_id };

        // ✅ Living Space
        this.living_space = data.living_space ? {
            bedrooms: data.living_space.bedrooms || 0,
            bathrooms: data.living_space.bathrooms || 0,
            area: data.living_space.area || 0
        } : null;


        // ✅ Images & Videos
        this.images = generateImageUrls(data.collectionId, data.id, data.images);
        this.videos = data.videos || [];

        this.key_features = data.key_features || [];


        // ✅ Amenities & Deal Types
        this.amenities = data.amenities || [];
        this.deal_types = data.deal_types || [];

        // ✅ Relations (Expanded Data or Raw IDs)
        this.categories = data.expand?.category_ids?.map(category => new Category(category, lang)) || data.category_ids || [];
        this.owner = data.expand?.owner_id ? new Owner(data.expand?.owner_id, lang) : { id: data.owner_id };
        this.project = data.expand?.project_id ? new Project(data.expand?.project_id, lang) : { id: data.project_id };
        this.agent = data.expand?.agent_id ? new Agent(data.expand?.agent_id, lang) : { id: data.agent_id };





        // ✅ Payment Plan
        this.payment_plan = data.payment_plan ? {
            down_payment: data.payment_plan.down_payment || 0,
            during_construction: data.payment_plan.during_construction || 0,
            on_handover: data.payment_plan.on_handover || 0
        } : null;

        // ✅ Contact Details
        this.contact = data.contact ? {
            whatsapp: data.contact.whatsapp || "",
            phone: data.contact.phone || "",
            email: data.contact.email || ""
        } : null;
    }
}

export default Property;