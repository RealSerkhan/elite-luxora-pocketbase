import pb from '../config/database.js';
import BaseResponse from '../models/base_response.js';
import Faq from '../models/faq.js';
import { getLanguage } from '../utils/get_language.js';

/**
 * 📌 Get About Us Information
 */
export const getMortgageFaqs = async (req, res) => {
    try {
        const lang=getLanguage(req);
        const faqsResponse = await pb.collection('mortgage_faqs').getFullList();
        const faqs=faqsResponse.map(faq=>new Faq(faq,lang));

        res.json(new BaseResponse(true,faqs,null));

    } catch (error) {
        console.log(error);
        res.status(404).json({ success: false, message: "couldnt get faqs of Mortgage" });
    }
};

