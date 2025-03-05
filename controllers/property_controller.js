import pb from '../config/database.js';
import Property from '../models/property.js';
import {buildBooleanMatch,buildExactMatch,buildKeywordSearch,buildMultiSelectFilter,buildMultiSelectJSONFilter,buildMultiSelectNumberFilter,buildNumericRange} from '../utils/filter.js';


export const getProperties = async (req, res) => {
    try {
        const lang = req.headers['accept-language'] || "en";
        
        // ✅ Build the filter in a separate function
        const filter_query = buildFilterQuery(req, lang);

        // ✅ Pagination
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        console.log(`Applied Filter: ${filter_query}, Page: ${page}, PerPage: ${per_page}`);

        // ✅ Fetch filtered properties from PocketBase
        const result = await pb.collection('properties').getList(page, per_page, {
            sort: '-created',
            filter: filter_query || undefined,
            expand: 'project_id,developer_id,owner_id,agent_id,category_ids,currency_id,area_id,city_id,country_id'
        });

        // ✅ Transform raw PocketBase data into `Property` objects
        const properties = result.items.map(item => new Property(item, lang));

        res.json({
            total_items: result.totalItems,
            total_pages: result.totalPages,
            current_page: page,
            per_page: per_page,
            properties
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

function buildFilterQuery(req, lang) {
    let filter = "";
  
    // 1. Single-value exact matches
    filter = addCondition(filter, buildExactMatch(req.query.city, 'city_id'));
    filter = addCondition(filter, buildExactMatch(req.query.country, 'country_id'));
    filter = addCondition(filter, buildExactMatch(req.query.project_id, 'project_id'));
    filter = addCondition(filter, buildExactMatch(req.query.agent_id, 'agent_id'));
  
    // 2. Multi-select: property_type, category_ids
    filter = addCondition(filter, buildMultiSelectFilter(req.query.property_types, 'property_type'));
    filter = addCondition(filter, buildMultiSelectJSONFilter(req.query.category_ids, 'category_ids'));
  
    // 3. Bedrooms & Bathrooms multi-select
    filter = addCondition(filter, buildMultiSelectNumberFilter(req.query.bedrooms,'living_space.bedrooms'));
    filter = addCondition(filter, buildMultiSelectNumberFilter(req.query.bathrooms,'living_space.bathrooms'));
  
    // 4. Price range
    const priceCondition = buildNumericRange(req.query.min_price, req.query.max_price, 'price');
    filter = addCondition(filter, priceCondition);
  
    // 5. Furnishing & Verified (booleans)
    filter = addCondition(filter, buildBooleanMatch(req.query.is_furnished, 'is_furnished'));
    filter = addCondition(filter, buildBooleanMatch(req.query.is_verified, 'is_verified'));
  
    // 6. Living space area
    const areaCondition = buildNumericRange(req.query.min_area, req.query.max_area, 'living_space.area');
    filter = addCondition(filter, areaCondition);
  
    // 7. Amenities & Deal Types (multi-select JSON)
    filter = addCondition(filter, buildMultiSelectJSONFilter(req.query.amenities, 'amenities'));
    filter = addCondition(filter, buildMultiSelectJSONFilter(req.query.deal_types, 'deal_types'));
  
    // 8. Keyword search
    filter = addCondition(filter, buildKeywordSearch(req.query.keywords, lang));
  
    // 9. Virtual Viewings (multi-select JSON)
    filter = addCondition(filter, buildMultiSelectJSONFilter(req.query.virtual_viewings, 'virtual_viewings'));
  
    return filter;
  }

  function addCondition(query, condition) {
    if (!condition) return query;  // Nothing to add
    return query ? `${query} && ${condition}` : condition;
  }

  

/**
 * 📌 Get a single property by ID
 */
export const getProperty= async (req, res) => {
    try {
        const property = await pb.collection('properties').getOne(req.params.id);
        res.json(property);
    } catch (error) {
        res.status(404).json({ success: false, error: "Property not found" });
    }
};

/**
 * 📌 Create a new property
 */
export const addProperty= async (req, res) => {
    try {
        const createdProperty = await pb.collection('properties').create(req.body);
        res.status(201).json({ success: true, id: createdProperty.id, data: createdProperty });
    } catch (error) {
        res.status(400).json({ success: false, error: error });
    }
};


/**
 * 📌 Update a property
 */
export const updateProperty= async (req, res) => {
    try {
        const updatedProperty = await pb.collection('properties').update(req.params.id, req.body);
        res.json({ success: true, data: updatedProperty });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * 📌 Delete a property
 */
export const deleteProperty= async (req, res) => {
    try {
        await pb.collection('properties').delete(req.params.id);
        res.json({ success: true, message: "Property deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};