import pb from '../config/database.js';

import { addCondition, buildExactMatch, buildNumericRange, buildSortOption } from '../utils/filter.js';
import Agent from '../models/agent.js';
import PaginatedResponse from '../models/paginated_response.js';
import { getLanguage } from '../utils/get_language.js';
import Transaction from '../models/transaction.js';



/**
 * 📌 Get All Closed Deals (with filters)
 */
export const getAgents = async (req, res) => {
    try {
        const lang = getLanguage(req);
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
        const result = await pb.collection('agents').getList(page, per_page, {
            sort: sortOption,
            filter: filter_query || undefined,
        });




        const agents = await Promise.all(
            result.items.map(async agentData => {
                const agent = new Agent(agentData, lang);
                const properties = await pb.collection('properties').getFullList({
                    filter: `agent_id = "${agent.id}"`,
                    fields: "id,deal_type" // ✅ Only fetch the minimum field to improve performance
                });
                // ✅ Count how many properties have deal_type = "sale"
                const salesCount = properties.filter(prop => prop.deal_type === "sale").length;

                // ✅ Count how many properties have deal_type = "rent"
                const rentsCount = properties.filter(prop => prop.deal_type === "rent").length;

                agent.sales_count = salesCount;
                agent.rents_count = rentsCount;
                return agent;

            }));
        console.log(agents);


        res.json(new PaginatedResponse(
            result.totalItems,
            result.totalPages,
            page,
            per_page,
            agents
        ));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 📌 Get a Single Agent by ID with Aggregated Sales & Rent Count
 */
export const getAgentById = async (req, res) => {
    try {
        const lang = getLanguage(req);

        // ✅ Fetch Agent Details
        const agent = await pb.collection('agents').getOne(req.params.id, { expand: 'area_ids' });

        // ✅ Fetch Aggregated Sales Count (Only get the total count)
        const properties = await pb.collection('properties').getFullList({
            filter: `agent_id = "${req.params.id}"`,
            fields: "id,deal_type" // ✅ Only fetch the minimum field to improve performance
        });
        console.log(properties);
        // ✅ Count how many properties have deal_type = "sale"
        const salesCount = properties.filter(prop => prop.deal_type === "sale").length;

        // ✅ Count how many properties have deal_type = "rent"
        const rentsCount = properties.filter(prop => prop.deal_type === "rent").length;
        // ✅ Fetch all properties linked to the agent
        const transactions = await pb.collection('transactions').getFullList({
            filter: `agent_id = "${req.params.id}"`,
            expand: 'property_id'
        });

        // ✅ Aggregate Data
        const closedDealsCount = transactions.length;
        const closedSalesCount = transactions.filter(t => t.deal_type === "sale").length;
        const closedRentCount = transactions.filter(t => t.deal_type === "rent").length;
        const totalSalesAmount = transactions
            .filter(t => t.deal_type === "sale")
            .reduce((sum, t) => sum + (t.total_price || 0), 0);
        const totalRentAmount = transactions
            .filter(t => t.deal_type === "rent")
            .reduce((sum, t) => sum + (t.total_price || 0), 0);



        // ✅ Add Sales & Rents Count Inside Agent Data
        const agentData = new Agent(agent, lang);
        agentData.sales_count = salesCount;
        agentData.rents_count = rentsCount;

        agentData.closed_deals_count = closedDealsCount;
        agentData.closed_sales_count = closedSalesCount;
        agentData.closed_rent_count = closedRentCount;
        agentData.total_sales_amount = totalSalesAmount;
        agentData.total_rent_amount = totalRentAmount;
        agentData.deals = transactions.map(transaction => new Transaction(transaction, lang));




        // ✅ Return Response
        res.json({ success: true, data: agentData });

    } catch (error) {
        console.log(error);

        res.status(404).json({ success: false, message: "Agent not found." });
    }
};