import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


 (async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
})(); console.log(error);


const uploadToCloudinary = async (localFilePath) => {

try{

    if(!localFilePath)
        return null;
        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type: "auto"

        })
// file has been uploaded sucessfully
console.log("File  is uploaded on cloudinary",response.url);
return response;

}catch(err){

fs.unlinkSync( localFilePath);// remove file from local uploads folder
console.log("Error while uploading file to cloudinary",err);
return null;

}
}
