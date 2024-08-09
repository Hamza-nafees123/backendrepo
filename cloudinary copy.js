const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const uploadImage = async (filePath) => {
//   try {
//     const response = await cloudinary.uploader.upload(filePath, {
//       folder: 'uploads',
//       resource_type: 'auto',
//     });
//     console.log('response in cloudinary:', response.url);
//     return response;
//   } catch (error) {
//     console.error(
//       'Error uploading to Cloudinary:',
//       JSON.stringify(error, null, 2)
//     );
//     return null;
//   }
// };

const uploadImage = async (filePath, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { resource_type: resourceType }, (error, result) => {
      if (error) {
        console.log("Error uploading to Cloudinary:", error);
        return reject(error);
      }
      resolve(result);
    });
  });
};

const deleteImgCloudinary = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId);
    console.log("deleteImg", response);
    return response;
  } catch (error) {
    console.log("deleteIMGERROR", error);
  }
};

module.exports = { uploadImage, deleteImgCloudinary };