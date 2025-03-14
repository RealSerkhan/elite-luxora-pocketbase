import pb from '../config/database.js';

import { DEAL_TYPES } from '../config/constants.js';
import { addCondition, buildExactMatch, buildNumericRange, buildSortOption } from '../utils/filter.js';
import Transaction from '../models/transaction.js';
import PaginatedResponse from '../models/paginated_response.js';

/**
 * 📌 Create a Closed Deal
 */
export const createTransaction = async (req, res) => {
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
export const getTransactions = async (req, res) => {
    try {
        const lang = req.headers['accept-language'] || "en";
        let filter_query = "";

        filter_query = addCondition(filter_query, buildExactMatch(req.query.agent_id, 'agent_id'));
        filter_query = addCondition(filter_query, buildExactMatch(req.query.property_type, 'property_id.property_type'));
        filter_query = addCondition(filter_query, buildExactMatch(req.query.deal_type, 'deal_type'));
        filter_query = addCondition(filter_query, buildExactMatch(req.query.currency, 'currency'));
        filter_query = addCondition(filter_query, buildNumericRange(req.query.min_price, req.query.max_price, 'price'));


        // ✅ Build the sort option
        const sortOption = buildSortOption(req);
        // **Pagination**
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        console.log(`Applied Filter: ${filter_query}, Page: ${page}, PerPage: ${per_page}`);

        // ✅ Fetch deals from PocketBase
        const result = await pb.collection('transactions').getList(page, per_page, {
            sort: sortOption,
            filter: filter_query || undefined
        });

        const transactions = result.items.map(item => new Transaction(item, lang));

        res.json(new PaginatedResponse(
            result.totalItems,
            result.totalPages,
            page,
            per_page,
            transactions
        ));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 📌 Get a Single Closed Deal by ID
 */
export const getTransactionsById = async (req, res) => {
    try {
        const deal = await pb.collection('transactions').getOne(req.params.id);
        res.json({ success: true, data: deal });
    } catch (error) {
        res.status(404).json({ success: false, message: "Closed deal not found." });
    }
};

