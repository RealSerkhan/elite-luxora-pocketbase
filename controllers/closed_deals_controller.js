import pb from '../config/database.js';

import { DEAL_TYPES } from '../config/constants.js';

/**
 * 📌 Create a Closed Deal
 */
export const createClosedDeal = async (req, res) => {
    try {
        const { location, deal_type, deal_date, property_type, bedrooms_count, commission, total_price, currency, agent_id } = req.body;

        // ✅ Validate required fields
        if (!location || !deal_type || !deal_date || !property_type || !bedrooms_count || !commission || !total_price || !currency || !agent_id) {
            return res.status(400).json({ success: false, message: "All fields are required, including agent_id." });
        }

        // ✅ Validate `deal_type` using the constant
        if (!DEAL_TYPES.includes(deal_type.toLowerCase())) {
            return res.status(400).json({ success: false, message: `Invalid deal type. Must be one of: ${DEAL_TYPES.join(", ")}` });
        }

        // ✅ Check if agent exists in `agents` collection
        try {
             await pb.collection('agents').getOne(agent_id);
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid agent_id. Agent not found." });
        }

        // ✅ Save to PocketBase
        const closedDeal = await pb.collection('closed_deals').create({
            location,
            deal_type,
            deal_date,
            property_type,
            bedrooms_count,
            commission,
            total_price,
            currency,
            agent_id
        });

        res.status(201).json({ success: true, message: "Closed deal recorded successfully.", data: closedDeal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 📌 Get All Closed Deals (with filters)
 */
export const getClosedDeals = async (req, res) => {
    try {
        let filter_query = "";

        if (req.query.deal_type) filter_query += `deal_type = "${req.query.deal_type}"`;
        if (req.query.property_type) filter_query += `${filter_query ? ' && ' : ''}property_type = "${req.query.property_type}"`;
        if (req.query.min_price) filter_query += `${filter_query ? ' && ' : ''}total_price >= ${req.query.min_price}`;
        if (req.query.max_price) filter_query += `${filter_query ? ' && ' : ''}total_price <= ${req.query.max_price}`;
        if (req.query.currency) filter_query += `${filter_query ? ' && ' : ''}currency = "${req.query.currency}"`;

        // **Pagination**
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        console.log(`Applied Filter: ${filter_query}, Page: ${page}, PerPage: ${per_page}`);

        // ✅ Fetch deals from PocketBase
        const result = await pb.collection('closed_deals').getList(page, per_page, {
            sort: '-deal_date',
            filter: filter_query || undefined
        });

        res.json({
            total_items: result.totalItems,
            total_pages: result.totalPages,
            current_page: page,
            per_page: per_page,
            deals: result.items
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 📌 Get a Single Closed Deal by ID
 */
export const getClosedDealById = async (req, res) => {
    try {
        const deal = await pb.collection('closed_deals').getOne(req.params.id);
        res.json({ success: true, data: deal });
    } catch (error) {
        res.status(404).json({ success: false, message: "Closed deal not found." });
    }
};