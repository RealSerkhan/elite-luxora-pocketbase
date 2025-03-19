import BaseModel from './base_model.js';


class PopularSearch extends BaseModel {
    constructor(data, lang = "en") {
        super(data);

        // ✅ Localized Name
        this.name = data[`name_${lang}`] || data.name_en;

        this.search_query = data.search_query;


    }
}

export default PopularSearch;