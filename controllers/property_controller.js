import pb from '../config/database.js';

export const getProperties = async (req, res) => {
    try {
        let filter_query = ""; 

        if (req.query.title) filter_query += `title ~ "${req.query.title}"`;
        if (req.query.description) filter_query += `${filter_query ? ' && ' : ''}description ~ "${req.query.description}"`;
        if (req.query.category) filter_query += `${filter_query ? ' && ' : ''}category.name = "${req.query.category}"`;
        if (req.query.property_type) filter_query += `${filter_query ? ' && ' : ''}property_type.name = "${req.query.property_type}"`;
        if (req.query.currency) filter_query += `${filter_query ? ' && ' : ''}currency.name = "${req.query.currency}"`;
        if (req.query.city) filter_query += `${filter_query ? ' && ' : ''}address.city = "${req.query.city}"`;
        if (req.query.country) filter_query += `${filter_query ? ' && ' : ''}address.country = "${req.query.country}"`;

        
        filter_query += `${filter_query ? ' && ' : ''}price >= ${req.query.min_price??0} && price <= ${req.query.max_price??999999999}`;
        
        if (req.query.min_bedrooms) {
            filter_query += `${filter_query ? ' && ' : ''}living_space.bedrooms >= ${req.query.min_bedrooms}`;
        }
        if (req.query.min_bathrooms) {
            filter_query += `${filter_query ? ' && ' : ''}living_space.bathrooms >= ${req.query.min_bathrooms}`;
        }
        if (req.query.min_area) {
            filter_query += `${filter_query ? ' && ' : ''}living_space.area >= ${req.query.min_area}`;
        }

        if (req.query.is_furnished !== undefined) {
            filter_query += `${filter_query ? ' && ' : ''}is_furnished = ${req.query.is_furnished}`;
        }
        if (req.query.is_featured !== undefined) {
            filter_query += `${filter_query ? ' && ' : ''}is_featured = ${req.query.is_featured}`;
        }
        if (req.query.is_verified !== undefined) {
            filter_query += `${filter_query ? ' && ' : ''}is_verified = ${req.query.is_verified}`;
        }

        if (req.query.posted_after && req.query.posted_before) {
            filter_query += `${filter_query ? ' && ' : ''}posted_date >= "${req.query.posted_after}" && posted_date <= "${req.query.posted_before}"`;
        }

        if (req.query.amenities) {
            const amenities_list = Array.isArray(req.query.amenities) 
                ? req.query.amenities 
                : [req.query.amenities]; // Ensure it's an array
        
            const amenities_filter = amenities_list
                .map(amenity => `amenities ?~ "${amenity}"`)
                .join(' || '); // Use OR condition to match any provided amenities
        
            filter_query += `${filter_query ? ' && ' : ''}(${amenities_filter})`;
        }
        if (req.query.deal_type) {
            filter_query += `${filter_query ? ' && ' : ''}deal_types ?~ "${req.query.deal_type}"`;
        }

        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        const result = await pb.collection('properties').getList(page, per_page, {
            sort: '-created',
            filter: filter_query || undefined,
            expand: 'project_id,owner_id,developer_id' 
        });

// ✅ Transform response: Move expanded fields & remove original IDs
const transformed_items = result.items.map(property => {
    const { developer_id, owner_id, project_id,expand, ...rest } = property; // Remove IDs

    return {
        ...rest, // Keep all other fields
        developer: property.expand?.developer_id || null,
        owner: property.expand?.owner_id || null,
        project: property.expand?.project_id || null
    };
});

res.json({
    total_items: result.totalItems,
    total_pages: result.totalPages,
    current_page: page,
    per_page: per_page,
    items: transformed_items, // Use transformed items
});
    } catch (error) {
        res.status(400).json({ success: false, error: error });
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