import { baseUrl } from "../config/database.js";

export const generateImageUrls = (collectionId, recordId, images = []) => {
    return images.map(fileName => `${baseUrl}/api/files/${collectionId}/${recordId}/${fileName}`);
};
export const generateImageUrl = (collectionId, recordId, image) => {
    return image? `${baseUrl}/api/files/${collectionId}/${recordId}/${image})`:null;
};