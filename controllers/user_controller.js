import pb from '../config/database.js';



/**
 * 📌 Add a property to favorites
 */
export const addToFavorites=  async (req, res) => {
    try {
        const { property_id } = req.body;
        const user_id = req.user.id;

        let existing_favorite = null;
        try {
            existing_favorite = await pb.collection('favorites').getFirstListItem(
                `user_id="${user_id}" && property_id="${property_id}"`
            );
        } catch (err) {
            console.log("No existing favorite found, proceeding.");
        }

        if (existing_favorite) {
            return res.status(400).json({ success: false, message: "Property already favorited" });
        }

        const favorite = await pb.collection('favorites').create({
            user_id,
            property_id
        });

        res.json({ success: true, message: "Property added to favorites",data: favorite });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


/**
 * 📌 Remove a property from favorites
 */
export const removeFromFavorites =async (req, res) => {
    try {
        const { property_id } = req.body;
        const user_id = req.user.id;

        const favorite = await pb.collection('favorites').getFirstListItem(
            `user_id="${user_id}" && property_id="${property_id}"`
        );

        if (!favorite) {
            return res.status(400).json({ success: false, message: "Favorite not found" });
        }

        await pb.collection('favorites').delete(favorite.id);

        res.json({ success: true, message: "Property removed from favorites" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * 📌 Get user favorites
 */
export const getFavorites= async (req, res) => {
    try {
        const user_id = req.user.id;

        const favorites = await pb.collection('favorites').getFullList({
            filter: `user_id="${user_id}"`,
            expand: 'property_id'
        });

        const properties = favorites
            .map(fav => fav.expand?.property_id)
            .filter(property => property !== undefined);

        res.json({ success: true, data: properties });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
