import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";

// Support multiple common env var names for cloudinary credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDNAME || process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.API_KEY || process.env.CLOUDINARY_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET || process.env.CLOUDINARY_SECRET;

if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
} else {
    console.warn('Cloudinary credentials not fully configured - uploads will fail.');
}
const uploadToCloudinary = async (localfile) => {
    try{
        if(!localfile) return null;
        if (!cloudName || !apiKey || !apiSecret) {
            console.log('Skipping upload: cloudinary not configured');
            try { fs.unlinkSync(localfile); } catch(e){}
            return null;
        }
        const response = await cloudinary.uploader.upload(localfile, { resource_type: "auto" });
        return response;
    }
    catch(error){
        console.log(error);
        fs.unlinkSync(localfile);
    }
}
export {uploadToCloudinary}
