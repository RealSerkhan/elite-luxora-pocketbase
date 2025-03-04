import pb from '../config/database.js';

/**
 * 📌 Get all projects (with filtering & pagination)
 */
export const getProjects = async (req, res) => {
    try {
        let filter_query = ""; // Initialize filter query

        if (req.query.title) filter_query += `title ~ "${req.query.title}"`;
        if (req.query.location) filter_query += `${filter_query ? ' && ' : ''}address.city = "${req.query.location}"`;
        if (req.query.developer) filter_query += `${filter_query ? ' && ' : ''}developer_id.name = "${req.query.developer}"`;
        if (req.query.country) filter_query += `${filter_query ? ' && ' : ''}address.country = "${req.query.country}"`;

        const expand_fields = ['developer_id'];
        const expand_query = expand_fields.join(',');

        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        const result = await pb.collection('projects').getList(page, per_page, {
            sort: '-created',
            filter: filter_query || undefined,
            expand: expand_query
        });

        // ✅ Transform Response
        const transformed_items = result.items.map(project => {
            const { developer_id, ...rest } = project;
            return {
                ...rest,
                developer: project.expand?.developer_id || null
            };
        });

        res.json({
            total_items: result.totalItems,
            total_pages: result.totalPages,
            current_page: page,
            per_page: per_page,
            items: transformed_items,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * 📌 Get a single project by ID
 */
export const getProjectById = async (req, res) => {
    try {
        const project = await pb.collection('projects').getOne(req.params.id, {
            expand: 'developer_id'
        });

        // ✅ Remove `developer_id` and expand data instead
        const { developer_id, ...rest } = project;
        res.status(201).json({ success: true, data:{
            ...rest,
             developer: project.expand?.developer_id || null} });
    } catch (error) {
        res.status(404).json({ success: false, error: "Project not found" });
    }
};

/**
 * 📌 Create a new project
 */
export const createProject = async (req, res) => {
    try {
        const {
            title, 
            down_payment, during_construction_payment, on_handover_payment,
            project_announcement_date, construction_started_date, expected_completion_date,
            master_plan, location_nearby_attractions, amenities, address, faq,
            developer_id, units, launch_price, goverment_fee, booking_started_date
        } = req.body;

        const createdProject = await pb.collection('projects').create({
            title,
            down_payment, during_construction_payment, on_handover_payment,
            project_announcement_date, construction_started_date, expected_completion_date,
            master_plan, location_nearby_attractions, amenities, address, faq,
            developer_id, units, launch_price, goverment_fee, booking_started_date
        });

        res.status(201).json({ success: true, id: createdProject.id, data: createdProject });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * 📌 Update a project
 */
export const updateProject = async (req, res) => {
    try {
        const updatedProject = await pb.collection('projects').update(req.params.id, req.body);
        res.json({ success: true, data: updatedProject });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * 📌 Delete a project
 */
export const deleteProject = async (req, res) => {
    try {
        await pb.collection('projects').delete(req.params.id);
        res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};