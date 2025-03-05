export const getLanguage = (req) => {
    return req.headers['accept-language']?.split(',')[0] || "en";
};