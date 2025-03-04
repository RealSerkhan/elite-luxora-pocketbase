import pb from '../config/database.js';

export const getProperties = async (req, res) => {
    try {
        let filter_query = "";
        if (req.query.city) filter_query += `${filter_query ? ' && ' : ''}address.city = "${req.query.city}"`;
        if (req.query.country) filter_query += `${filter_query ? ' && ' : ''}address.country = "${req.query.country}"`;
        if (req.query.category) filter_query += `${filter_query ? ' && ' : ''}category.name = "${req.query.category}"`;

        // **Project ID Filter**
        if (req.query.project_id) {
            filter_query += `${filter_query ? ' && ' : ''}project_id = "${req.query.project_id}"`;
        }

        // **Property Type (Multi-Select)**
        if (req.query.property_type) {
            const propertyTypes = req.query.property_type.split(',');
            const typeConditions = propertyTypes.map(type => 'property_type.id = "' + type + '"').join(' || ');
            filter_query += filter_query ? ' && (' + typeConditions + ')' : '(' + typeConditions + ')';
        }

        // **Bedrooms (Multi-Select)**
        if (req.query.bedrooms) {
            const bedrooms = req.query.bedrooms.split(',');
            const bedroomConditions = bedrooms.map(bed => 'living_space.bedrooms = ' + bed).join(' || ');
            filter_query += filter_query ? ' && (' + bedroomConditions + ')' : '(' + bedroomConditions + ')';
        }

        // **Bathrooms (Multi-Select)**
        if (req.query.bathrooms) {
            const bathrooms = req.query.bathrooms.split(',');
            const bathroomConditions = bathrooms.map(bath => 'living_space.bathrooms = ' + bath).join(' || ');
            filter_query += filter_query ? ' && (' + bathroomConditions + ')' : '(' + bathroomConditions + ')';
        }

        // **Price Range**
        if (req.query.min_price) {
            filter_query += (filter_query ? ' && ' : '') + 'price >= ' + req.query.min_price;
        }
        if (req.query.max_price) {
            filter_query += (filter_query ? ' && ' : '') + 'price <= ' + req.query.max_price;
        }

        // **Furnishing (Multi-Select)**
        if (req.query.furnishing) {
            const furnishings = req.query.furnishing.split(',');
            const furnishingConditions = furnishings.map(furnish => 'furnishing = "' + furnish + '"').join(' || ');
            filter_query += filter_query ? ' && (' + furnishingConditions + ')' : '(' + furnishingConditions + ')';
        }

        // **Completion Status (Single-Select)**
        if (req.query.completion_status) {
            filter_query += (filter_query ? ' && ' : '') + 'completion_status = "' + req.query.completion_status + '"';
        }

        // **Property Size (sqft)**
        if (req.query.min_area) {
            filter_query += (filter_query ? ' && ' : '') + 'living_space.area >= ' + req.query.min_area;
        }
        if (req.query.max_area) {
            filter_query += (filter_query ? ' && ' : '') + 'living_space.area <= ' + req.query.max_area;
        }

        // **Amenities (Multi-Select)**
        if (req.query.amenities) {
            const amenities = req.query.amenities.split(',');
            const amenityConditions = amenities.map(amenity => 'amenities ?~ "' + amenity + '"').join(' && ');
            filter_query += filter_query ? ' && (' + amenityConditions + ')' : '(' + amenityConditions + ')';
        }

        // **Keywords Search**
        if (req.query.keywords) {
            filter_query += (filter_query ? ' && ' : '') + 'description ~ "' + req.query.keywords + '"';
        }

        // **Virtual Viewings (Multi-Select)**
        if (req.query.virtual_viewings) {
            const virtualViewings = req.query.virtual_viewings.split(',');
            const viewConditions = virtualViewings.map(view => 'virtual_viewings ?~ "' + view + '"').join(' && ');
            filter_query += filter_query ? ' && (' + viewConditions + ')' : '(' + viewConditions + ')';
        }

        // **Pagination**
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        console.log(`Applied Filter: ${filter_query}, Page: ${page}, PerPage: ${per_page}`);

        // **Fetch filtered properties from PocketBase**
        const result = await pb.collection('properties').getList(page, per_page, {
            sort: '-created',
            filter: filter_query || undefined,
            expand: 'project_id,developer_id,owner_id'
        });
        const transformed_items = result.items.map(property => {
            const { developer_id,owner_id,project_id,expand, ...rest } = property;
            return {
                ...rest,
                project: property.expand?.project_id || null,
                owner: property.expand?.owner_id || null,
                developer: property.expand?.developer_id || null
            };
        });

        res.json({
            total_items: result.totalItems,
            total_pages: result.totalPages,
            current_page: page,
            per_page: per_page,
            properties: transformed_items
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
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