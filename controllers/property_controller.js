import pb from '../config/database.js';
import Property from '../models/property.js';


export const getProperties = async (req, res) => {
    try {
        const lang = req.headers['accept-language'] || "en"; // ✅ Get language from headers
        let filter_query = "";

        // ✅ Filter by City & Country
        if (req.query.city) filter_query += `${filter_query ? ' && ' : ''}address.city = "${req.query.city}"`;
        if (req.query.country) filter_query += `${filter_query ? ' && ' : ''}address.country = "${req.query.country}"`;

        // ✅ Filter by Project & Agent ID
        if (req.query.project_id) filter_query += `${filter_query ? ' && ' : ''}project_id = "${req.query.project_id}"`;
        if (req.query.agent_id) filter_query += `${filter_query ? ' && ' : ''}agent_id = "${req.query.agent_id}"`;

        // ✅ Filter by Property Type (Multi-Select)
        if (req.query.property_type) {
            const propertyTypes = req.query.property_type.split(',');
            const typeConditions = propertyTypes.map(type => `property_type_id = "${type}"`).join(' || ');
            filter_query += filter_query ? ` && (${typeConditions})` : `(${typeConditions})`;
        }

        // ✅ Filter by Category (Multi-Select)
        if (req.query.category_ids) {
            const categoryIds = req.query.category_ids.split(',');
            const categoryConditions = categoryIds.map(cat => `category_ids ?~ "${cat}"`).join(' && ');
            filter_query += filter_query ? ` && (${categoryConditions})` : `(${categoryConditions})`;
        }

        // ✅ Filter by Bedrooms & Bathrooms (Multi-Select)
        if (req.query.bedrooms) {
            const bedrooms = req.query.bedrooms.split(',');
            const bedroomConditions = bedrooms.map(bed => `living_space.bedrooms = ${bed}`).join(' || ');
            filter_query += filter_query ? ` && (${bedroomConditions})` : `(${bedroomConditions})`;
        }

        if (req.query.bathrooms) {
            const bathrooms = req.query.bathrooms.split(',');
            const bathroomConditions = bathrooms.map(bath => `living_space.bathrooms = ${bath}`).join(' || ');
            filter_query += filter_query ? ` && (${bathroomConditions})` : `(${bathroomConditions})`;
        }

        // ✅ Filter by Price Range
        if (req.query.min_price) filter_query += (filter_query ? ' && ' : '') + `price >= ${req.query.min_price}`;
        if (req.query.max_price) filter_query += (filter_query ? ' && ' : '') + `price <= ${req.query.max_price}`;

        // ✅ Filter by Furnishing Status
        if (req.query.is_furnished !== undefined) {
            filter_query += `${filter_query ? ' && ' : ''}is_furnished = ${req.query.is_furnished}`;
        }

        // ✅ Filter by Completion Status
        if (req.query.is_verified !== undefined) {
            filter_query += `${filter_query ? ' && ' : ''}is_verified = ${req.query.is_verified}`;
        }

        // ✅ Filter by Property Size
        if (req.query.min_area) filter_query += (filter_query ? ' && ' : '') + `living_space.area >= ${req.query.min_area}`;
        if (req.query.max_area) filter_query += (filter_query ? ' && ' : '') + `living_space.area <= ${req.query.max_area}`;

        // ✅ Filter by Amenities (Multi-Select)
        if (req.query.amenities) {
            const amenities = req.query.amenities.split(',');
            const amenityConditions = amenities.map(amenity => `amenities ?~ "${amenity}"`).join(' && ');
            filter_query += filter_query ? ` && (${amenityConditions})` : `(${amenityConditions})`;
        }

        // ✅ Filter by Deal Types (Multi-Select)
        if (req.query.deal_types) {
            const dealTypes = req.query.deal_types.split(',');
            const dealConditions = dealTypes.map(deal => `deal_types ?~ "${deal}"`).join(' && ');
            filter_query += filter_query ? ` && (${dealConditions})` : `(${dealConditions})`;
        }

        // ✅ Filter by Keywords
        if (req.query.keywords) {
            filter_query += (filter_query ? ' && ' : '') + `description_${lang} ~ "${req.query.keywords}"`;
        }

        // ✅ Filter by Virtual Viewings
        if (req.query.virtual_viewings) {
            const virtualViewings = req.query.virtual_viewings.split(',');
            const viewConditions = virtualViewings.map(view => `virtual_viewings ?~ "${view}"`).join(' && ');
            filter_query += filter_query ? ` && (${viewConditions})` : `(${viewConditions})`;
        }

        // ✅ Pagination
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        console.log(`Applied Filter: ${filter_query}, Page: ${page}, PerPage: ${per_page}`);

        // ✅ Fetch filtered properties from PocketBase
        const result = await pb.collection('properties').getList(page, per_page, {
            sort: '-created',
            filter: filter_query || undefined,
            expand: 'project_id,developer_id,owner_id,agent_id,category_ids,currency_id,property_type_id'
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