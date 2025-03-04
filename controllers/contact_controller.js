import pb from '../config/database.js';
import transporter from '../config/mailer.js';

/**
 * 📌 Handle Contact Form Submission
 */
export const submitContactForm = async (req, res) => {
    try {
        const { name, email, phone_number, subject, message } = req.body;

        if (!name || !email || !phone_number || !subject || !message) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // ✅ Store the contact message in PocketBase
        await pb.collection('contacts').create({
            name,
            email,
            phone_number,
            subject,
            message
        });

        // ✅ Send an email notification (optional)
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // Admin email (set in `.env`)
            to: process.env.EMAIL_USER,  // Support email
            subject: `New Contact Us Submission: ${subject}`,
            text: `
                Name: ${name}
                Email: ${email}
                Phone Number: ${phone_number}
                Subject: ${subject}
                Message: ${message}
            `
        });

        res.status(201).json({ success: true, message: "Contact form submitted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};