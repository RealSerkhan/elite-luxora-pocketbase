import pb from '../config/database.js';

/**
 * 📌 Get About Us Information
 */
export const getAboutUs = async (req, res) => {
    try {
        const aboutInfo = await pb.collection('about_us').getFirstListItem();

        res.json({
            company_name: aboutInfo.company_name,
            description: aboutInfo.description,
            address: aboutInfo.address,
            telephone: aboutInfo.telephone,
            fax: aboutInfo.fax,
            email: aboutInfo.email,
            website: aboutInfo.website,
            social_media: aboutInfo.social_media,
            founders: aboutInfo.founders,
            vision: aboutInfo.vision,
            mission: aboutInfo.mission,
            logo: aboutInfo.logo
        });
    } catch (error) {
        res.status(404).json({ success: false, message: "About Us information not found" });
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