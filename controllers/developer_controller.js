import pb from '../config/database.js';
import { getLanguage } from '../utils/get_language.js';
import Developer from '../models/developer.js';


/**
 * 📌 Get all developers (with filtering & pagination)
 */
export const getDevelopers = async (req, res) => {
    try {
        const lang = req.headers['accept-language'] || "en"; // ✅ Get language from headers


        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        const result = await pb.collection('developers').getList(page, per_page, {
        });

        // ✅ Transform Response
        const transformed_items = result.items.map(developer => new Developer(developer, lang));

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
 * 📌 Get a single project by ID
 */
export const getDeveloperById = async (req, res) => {
    try {

        const lang = getLanguage(req);


        const developer = await pb.collection('developers').getOne(req.params.id);

        // ✅ Remove `developer_id` and expand data instead

        res.status(201).json({ success: true, data: new Developer(developer, lang) });
    } catch (error) {
        res.status(404).json({ success: false, error: "Developer not found" });
    }
};

