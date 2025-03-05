/**
 * 📌 Validate Email Format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * 📌 Validate Phone Number Format (Allows +, digits, spaces, dashes, and parentheses)
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    return phoneRegex.test(phone);
};