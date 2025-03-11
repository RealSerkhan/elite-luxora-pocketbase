import Area from './area.js';
import BaseModel from './base_model.js';
import City from './city.js';
import Country from './country.js';
import Developer from './developer.js';

class Project extends BaseModel {
    constructor(data, lang = "en") {
        super(data);
        
        // ✅ Localized Title
        this.title = data[`title_${lang}`] || data.title_en;

        // ✅ Payment Plan
        this.down_payment = data.down_payment || 0;
        this.during_construction_payment = data.during_construction_payment || 0;
        this.on_handover_payment = data.on_handover_payment || 0;

        // ✅ Important Dates
        this.project_announcement_date =  Date(data.project_announcement_date) || null;
        this.construction_started_date =  Date(data.construction_started_date) || null;
        this.expected_completion_date =  Date(data.expected_completion_date) || null;
        this.booking_started_date =  Date(data.booking_started_date) || null;

        // ✅ Master Plan (Image)
        this.master_plan = data.master_plan || "";

        // ✅ Location Nearby Attractions
        this.location_nearby_attractions = data.location_nearby_attractions || {};

        // ✅ Amenities
        this.amenities = data.amenities || {};

        // ✅ Address
        this.address = data.address ? {
            city: data.address.city || "",
            country: data.address.country || "",
            street: data.address.street || "",
            zip_code: data.address.zip_code || ""
        } : null;

        // ✅ FAQ (Frequently Asked Questions)
        this.faq = data.faq || {};

        // ✅ Developer (Relation)
        this.developer = data.expand?.developer_id?new Developer(data.expand?.developer_id,lang):{id:data?.developer_id};
        this.location = {
            "area":    data.expand?.area_id? new Area(data.expand?.area_id,lang) : { id: data.area_id },
            "city" :   data.expand?.city_id? new City(data.expand?.city_id,lang) : { id: data.city_id },
            "country": data.expand?.country_id? new Country(data.expand?.country_id,lang) : { id: data.country_id }
          };

        
        // ✅ Geography
        this.geography = data.geography ? {
            address_name: data.geography.address_name || "",
            lat: data.geography.lat || 0,
            lon: data.geography.lon || 0,

        } : null;

        // ✅ Units Available
        this.units = data.units ? {
            type: data.units.type || "",
            size: data.units.size || 0
        } : null;

        // ✅ Pricing & Fees
        this.launch_price = data.launch_price ;
        this.goverment_fee = data.goverment_fee;
    }
}

export default Project;