import pb from '../config/database.js';
import BaseResponse from '../models/base_response.js';
import City from '../models/city.js';
import { getLanguage } from '../utils/get_language.js';

/**
 * 📌 Get About Us Information
 */
export const getCities = async (req, res) => {
    try {
        const lang = getLanguage(req);

        const result = await pb.collection('cities').getFullList();

        const cities = result.map(city => new City(city, lang))

        res.json(new BaseResponse(true, cities));
    } catch (error) {
        console.log(error);
        res.status(404).json(
            new BaseResponse(false, null, "cities not found"));
    }
};

