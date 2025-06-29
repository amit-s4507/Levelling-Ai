import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError.js";

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null

        // Check if file exists before trying to upload
        if (!fs.existsSync(localFilePath)) {
            console.error("File not found:", localFilePath);
            return null;
        }

        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })

        //file has been uploaded successfully
        console.log("File uploaded to cloudinary:", response.url);

        // Safely delete the local file
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
            console.error("Error deleting temporary file:", unlinkError);
            // Don't throw error here, as upload was successful
        }
        return response;
    } catch (error) {
        console.error("Cloudinary upload error:", error);  // Add error logging

        // Safely try to delete the temporary file
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (unlinkError) {
            console.error("Error deleting temporary file:", unlinkError);
        }

        // Throw a proper API error
        throw new ApiError(500, "Error uploading file to cloud storage");
    }
}

export {uploadOnCloudinary}
