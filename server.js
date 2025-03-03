import express from 'express';
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';



dotenv.config();

const app = express();
app.use(express.json());


const pb = new PocketBase('http://185.162.11.43:9090');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "realserxanbeyli@gmail.com",
        pass: "xsdc yabc xerj nvph",
    }
});



const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        const auth_data = await pb.collection('users').authRefresh(token);
        req.user = auth_data.record; 
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

/**
 * 📌 Get all properties (with filtering & pagination)
 */
app.get('/api/properties', async (req, res) => {
    try {
        let filter_query = ""; 

        if (req.query.title) filter_query += `title ~ "${req.query.title}"`;
        if (req.query.description) filter_query += `${filter_query ? ' && ' : ''}description ~ "${req.query.description}"`;
        if (req.query.category) filter_query += `${filter_query ? ' && ' : ''}category.name = "${req.query.category}"`;
        if (req.query.property_type) filter_query += `${filter_query ? ' && ' : ''}property_type.name = "${req.query.property_type}"`;
        if (req.query.currency) filter_query += `${filter_query ? ' && ' : ''}currency.name = "${req.query.currency}"`;
        if (req.query.city) filter_query += `${filter_query ? ' && ' : ''}address.city = "${req.query.city}"`;
        if (req.query.country) filter_query += `${filter_query ? ' && ' : ''}address.country = "${req.query.country}"`;

        
        filter_query += `${filter_query ? ' && ' : ''}price >= ${req.query.min_price??0} && price <= ${req.query.max_price??999999999}`;
        
        if (req.query.min_bedrooms) {
            filter_query += `${filter_query ? ' && ' : ''}living_space.bedrooms >= ${req.query.min_bedrooms}`;
        }
        if (req.query.min_bathrooms) {
            filter_query += `${filter_query ? ' && ' : ''}living_space.bathrooms >= ${req.query.min_bathrooms}`;
        }
        if (req.query.min_area) {
            filter_query += `${filter_query ? ' && ' : ''}living_space.area >= ${req.query.min_area}`;
        }

        if (req.query.is_furnished !== undefined) {
            filter_query += `${filter_query ? ' && ' : ''}is_furnished = ${req.query.is_furnished}`;
        }
        if (req.query.is_featured !== undefined) {
            filter_query += `${filter_query ? ' && ' : ''}is_featured = ${req.query.is_featured}`;
        }
        if (req.query.is_verified !== undefined) {
            filter_query += `${filter_query ? ' && ' : ''}is_verified = ${req.query.is_verified}`;
        }

        if (req.query.posted_after && req.query.posted_before) {
            filter_query += `${filter_query ? ' && ' : ''}posted_date >= "${req.query.posted_after}" && posted_date <= "${req.query.posted_before}"`;
        }

        if (req.query.amenities) {
            const amenities_list = Array.isArray(req.query.amenities) 
                ? req.query.amenities 
                : [req.query.amenities]; // Ensure it's an array
        
            const amenities_filter = amenities_list
                .map(amenity => `amenities ?~ "${amenity}"`)
                .join(' || '); // Use OR condition to match any provided amenities
        
            filter_query += `${filter_query ? ' && ' : ''}(${amenities_filter})`;
        }
        if (req.query.deal_type) {
            filter_query += `${filter_query ? ' && ' : ''}deal_types ?~ "${req.query.deal_type}"`;
        }

        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;

        const result = await pb.collection('properties').getList(page, per_page, {
            sort: '-created',
            filter: filter_query || undefined,
            expand: 'project_id,owner_id,developer_id' 
        });

// ✅ Transform response: Move expanded fields & remove original IDs
const transformed_items = result.items.map(property => {
    const { developer_id, owner_id, project_id,expand, ...rest } = property; // Remove IDs

    return {
        ...rest, // Keep all other fields
        developer: property.expand?.developer_id || null,
        owner: property.expand?.owner_id || null,
        project: property.expand?.project_id || null
    };
});

res.json({
    total_items: result.totalItems,
    total_pages: result.totalPages,
    current_page: page,
    per_page: per_page,
    items: transformed_items, // Use transformed items
});
    } catch (error) {
        res.status(400).json({ success: false, error: error });
    }
});
/**
 * 📌 Get a single property by ID
 */
app.get('/api/properties/:id', async (req, res) => {
    try {
        const property = await pb.collection('properties').getOne(req.params.id);
        res.json(property);
    } catch (error) {
        res.status(404).json({ success: false, error: "Property not found" });
    }
});

/**
 * 📌 Create a new property
 */
app.post('/api/properties', async (req, res) => {
    try {
        const createdProperty = await pb.collection('properties').create(req.body);
        res.status(201).json({ success: true, id: createdProperty.id, data: createdProperty });
    } catch (error) {
        res.status(400).json({ success: false, error: error });
    }
});

/**
 * 📌 Update a property
 */
app.put('/api/properties/:id', async (req, res) => {
    try {
        const updatedProperty = await pb.collection('properties').update(req.params.id, req.body);
        res.json({ success: true, data: updatedProperty });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * 📌 Delete a property
 */
app.delete('/api/properties/:id', async (req, res) => {
    try {
        await pb.collection('properties').delete(req.params.id);
        res.json({ success: true, message: "Property deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});




/**
 * 📌 User Login API
 */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Authenticate user with PocketBase
        const authData = await pb.collection('users').authWithPassword(email, password);

        res.json({
            success: true,
            token: authData.token,
            user: authData.record,
        });
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid email or password" });
    }
});

/**
 * 📌 Step 1: Generate and Send OTP
 */
app.post('/api/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user already exists

      try{          await pb.collection('temporaryUsers').getFirstListItem(`email="${email}"`);
       }        
       catch(error){
        console.log("Temporary user not found:");

        }        

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP temporarily in PocketBase
        await pb.collection('temporaryUsers').create({
            "email":email,
            "otp":otp
        });

        // Send OTP via Email
        await transporter.sendMail({
            from: "realserxanbeyli@gmail.com",//TODO change
            to: email,
            subject: "Your OTP for Registration",
            text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
        });

        res.json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        res.status(400).json({ success: false, message: error });
    }
});

/**
 * 📌 Step 2: Verify OTP and Complete Registration
 */
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, otp, password, passwordConfirm } = req.body;

        console.log("Verifying OTP for email:", email);

        // Retrieve the stored OTP from "temporaryUsers"
        let tempUser;
        try {
            tempUser = await pb.collection('temporaryUsers').getFirstListItem(`email="${email}"`);
        } catch (error) {
            return res.status(400).json({ success: false, message: "OTP expired or not found. Please request a new OTP." });
        }

        console.log("Temporary user found:", tempUser);

        // Check if OTP matches
        if (tempUser.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Ensure passwords match
        if (password !== passwordConfirm) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        // ✅ Create a new user in the "users" collection
        const newUser = await pb.collection('users').create({
            email,
            password,
            passwordConfirm
        });

        console.log("User registered successfully:", newUser);

        // ✅ Delete temporary user record after successful registration
        await pb.collection('temporaryUsers').delete(tempUser.id);

        res.json({ success: true, message: "Registration complete. You can now log in." });
    } catch (error) {
        console.error("Error in /api/verify-otp:", error);
        res.status(400).json({ success: false, message: "Error verifying OTP" });
    }
});

/**
 * 📌 Add a property to favorites
 */
app.post('/api/favorites', authenticateUser, async (req, res) => {
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

        res.json({ success: true, message: "Property added to favorites", favorite });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


/**
 * 📌 Remove a property from favorites
 */
app.delete('/api/favorites', authenticateUser, async (req, res) => {
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
});

/**
 * 📌 Get user favorites
 */
app.get('/api/favorites', authenticateUser, async (req, res) => {
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
});



app.listen(3000, () => {
    console.log('API server running on http://0.0.0.1:3000');
});