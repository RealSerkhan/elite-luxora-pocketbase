import pb from '../config/database.js';
import Area from '../models/area.js';
import City from '../models/city.js';
import { getLanguage } from '../utils/get_language.js';

/**
 * 📌 Search Autocomplete API (City, Area, Building)
 */
export const searchAutocomplete = async (req, res) => {
    try {
        const lang=getLanguage(req);
        const query = req.query.q?.trim();
        if (!query) {
            return res.status(400).json({ success: false, message: "Query parameter 'q' is required" });
        }

        // ✅ Fetch matching results from Cities, Communities (Areas), and Buildings
        const citiesResponse = await pb.collection('cities').getFullList({
            filter: `name_en ~ "${query}" || name_ar ~ "${query}"`,
            expand: "country_id"
        });
        const cities=citiesResponse.map(city=>new City(city,lang));

        const areasExpand=['city_id,country_id'];
        const areasResponse = await pb.collection('areas').getFullList({
            filter: `name_en ~ "${query}" || name_ar ~ "${query}"`,
            expand: areasExpand, // ✅ Get city data
        });

        const areas=areasResponse.map(area=>new Area(area,lang));
console.log(areas);
        // ✅ Format the response
        const formattedResults = [];

        // 🔹 Cities
        cities.forEach(city => {
            formattedResults.push({
                type: "city",
                id: city.id,
                name: city.name,
                country:city.country.name,
                icon: "location_city"
            });
        });

        // 🔹 Areas (Communities)
        areas.forEach(area => {
            formattedResults.push({
                type: "area",
                id: area.id,
                name: area.name,
                city:area.city.name,
                country:area.country.name,
                icon: "location_on"
            });
        });



        res.json({
            success: true,
            data: formattedResults
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error fetching search results", error: error.message });
    }
};

