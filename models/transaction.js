import { generateImageUrl } from '../utils/image_helper.js';
import Agent from './agent.js';
import BaseModel from './base_model.js';
import Property from './property.js';


class Transaction extends BaseModel {
    constructor(data, lang = "en") {
        super(data);
        
        // ✅ Localized Name
        this.deal_type = data.deal_type;
        // ✅ Image Link
        this.image_link = generateImageUrl(data.collectionId, data.id, data.image_link);
        this.deal_date = data.deal_date?new Date(data.deal_date) : null;
        this.commusion=data.commusion || 0;
        this.total_price=data.total_price || 0;
        this.currency = data.currency;
        this.agent = data.expand?.agent_id? new Agent(data.expand?.agent_id,lang) : { id: data.agent_id };
        this.property = data.expand?.property_id? new Property(data.expand?.property_id,lang) : { id: data.property_id };
        this.contract_type = data.contract_type;
    }
}

export default Transaction;