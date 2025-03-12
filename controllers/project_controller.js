import pb from '../config/database.js';
import Project from '../models/project.js';
import { getLanguage } from '../utils/get_language.js';
import {addCondition,buildExactMatch,} from '../utils/filter.js';


/**
 * 📌 Get all projects (with filtering & pagination)
 */
export const getProjects = async (req, res) => {
    try {
        const lang = req.headers['accept-language'] || "en"; // ✅ Get language from headers

        let filter_query = ""; // Initialize filter query

        if (req.query.title) filter_query += `title ~ "${req.query.title}"`;
        filter_query = addCondition(filter_query, buildExactMatch(req.query.city, 'city_id'));
        filter_query = addCondition(filter_query, buildExactMatch(req.query.area, 'area_id'));
        filter_query = addCondition(filter_query, buildExactMatch(req.query.country, 'country_id'));
        filter_query = addCondition(filter_query, buildExactMatch(req.query.developer, 'developer._id.name'));

        const expand_fields = ['developer_id,city_id,area_id,country_id'];
        const expand_query = expand_fields.join(',');

        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        const result = await pb.collection('projects').getList(page, per_page, {
            sort: '-created',
            filter: filter_query || undefined,
            expand: expand_query
        });

        // ✅ Transform Response
        const transformed_items = result.items.map(project => new Project(project,lang));

        res.json({
            success: true,
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
 * 📌 Get all projects (with filtering & pagination)
 */
export const getSimilarProjects = async (req, res) => {
    try {
        const lang = req.headers['accept-language'] || "en"; // ✅ Get language from headers
        const expand_fields = ['developer_id,city_id,area_id,country_id'];


        const projectResponse = await pb.collection('projects').getOne(req.query.id, {
            expand: expand_fields
        });
        const project=new Project(projectResponse,lang);


        let filter_query = ""; // Initialize filter query


        if (req.query.title) filter_query += `title ~ "${req.query.title}"`;
        filter_query = addCondition(filter_query, buildExactMatch(project.location.city.id, 'city_id'),"||");
        filter_query = addCondition(filter_query, buildExactMatch(project.location.area.id, 'area_id'),"||");
        filter_query = addCondition(filter_query, buildExactMatch(project.developer.id, 'developer_id'),"||");

        const expand_query = expand_fields.join(',');



        const result = await pb.collection('projects').getList(0, 3, {
            sort: '-created',
            filter: filter_query || undefined,
            expand: expand_query
        });

        // ✅ Transform Response
        const transformed_items = result.items.map(project => new Project(project,lang)).filter(project=>project.id!=req.query.id);


        res.json({
            success: true,
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

       const lang =getLanguage(req);

        
        const project = await pb.collection('projects').getOne(req.params.id, {
            expand: 'developer_id'
        });

        // ✅ Remove `developer_id` and expand data instead
        
        res.status(201).json({ success: true, data:new Project(project,lang)});
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
            master_plan, location_nearby_attractions, amenities,geography, faq,
            developer_id, units, launch_price, goverment_fee, booking_started_date,city_id,area_id,country_id
        } = req.body;

        const createdProject = await pb.collection('projects').create({
            title,
            down_payment, during_construction_payment, on_handover_payment,
            project_announcement_date, construction_started_date, expected_completion_date,
            master_plan, location_nearby_attractions, amenities, geography, faq,
            developer_id, units, launch_price, goverment_fee, booking_started_date,city_id,
            country_id,area_id
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