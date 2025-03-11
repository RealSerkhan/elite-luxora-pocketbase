import PocketBase from 'pocketbase';
import dotenv from 'dotenv';

dotenv.config();

export const baseUrl = 'http://185.162.11.43:9090';


const pb = new PocketBase(baseUrl);


export default pb;