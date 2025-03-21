import { generateImageUrl } from '../utils/image_helper.js';
import BaseModel from './base_model.js';
import City from './city.js';
import Country from './country.js';


class Area extends BaseModel {
    constructor(data, lang = "en") {
        super(data);

        // ✅ Localized Name
        this.name = data[`name_${lang}`] || data.name_en;

        this.reviews = data.reviews;

        this.city=data.expand?.city_id?new City(data.expand.city_id,lang):null;
        this.country=data.expand?.country_id? new Country(data.expand.country_id,lang):null;

        // ✅ Image Link
        this.image_link = generateImageUrl(data.collectionId, data.id, data.image_link);
    }
}

export default Area;