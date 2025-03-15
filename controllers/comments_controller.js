import pb from '../config/database.js';
import BaseResponse from '../models/base_response.js';
import Comment from '../models/comment.js';
import { getLanguage } from '../utils/get_language.js';

/**
 * 📌 Get About Us Information
 */
export const getComments = async (req, res) => {
    try {
        const lang = getLanguage(req);

        // **Pagination**
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;
        const result = await pb.collection('comments').getList(page, per_page);

        const comments = result.items.map(comment => new Comment(comment, lang))

        res.json(new BaseResponse(true, comments));
    } catch (error) {
        console.log(error);
        res.status(404).json({ success: false, message: "comments not found" });
    }
};

/**
 * 📌 Update About Us Information
 */
export const updateAboutUs = async (req, res) => {
    try {
        const aboutInfo = await pb.collection('about_us').getFirstListItem();

        const updatedAboutUs = await pb.collection('about_us').update(aboutInfo.id, req.body);

        res.json({ success: true, message: "About Us updated successfully", data: updatedAboutUs });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};