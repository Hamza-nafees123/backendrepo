const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const allowedTypes = [
//   'image/jpeg',
//   'image/png',
//   'application/pdf',
//   'application/epub+zip',
//   'application/vnd.amazon.ebook',
//   'application/x-mobipocket-ebook',
//   'audio/mpeg',
//   'video/mp4',
//   'audio/wav',
//   'video/avi',
//   'application/x-bzip2',
// ];



const uploadCloudinary = (fileBuffer, mimeType, resourceType = 'auto', folder = '') => {
  if (!fileBuffer) {
    return Promise.resolve(null); // Return a resolved promise with null if no fileBuffer
  }


  // if (!allowedTypes.includes(mimeType)) {
  //   return Promise.reject({ message: 'Unsupported file type', mimeType });
  // }

  // Determine the format based on mimeType
  // const format = mimeType.split('/')[1];


  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: "auto", format: mimeType.split('/')[1],
      
  } // Set the format explicitly };
    if (folder) {
    uploadOptions.folder = folder;
  }

  const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
    if (error) {
      console.error('Cloudinary upload error', error);
      reject(error);
    } else {
      resolve(result);
    }
  });

  stream.end(fileBuffer);
});
};

const uploadToCloudinary = (fileBuffer, mimeType, folder = "") => {
  if (!fileBuffer) {
    console.log("No fileBuffer provided");
    return Promise.resolve(null);
  }

  // Determine the format based on mimeType
  let format;
  if (mimeType === "application/epub+zip") {
    format = "epub";
  } else if (
    mimeType === "application/vnd.amazon.ebook" ||
    mimeType === "application/x-mobipocket-ebook"
  ) {
    format = "mobi";
  } else {
    format = mimeType?.split("/")[1];
  }

  console.log("MIME Type:", mimeType);
  console.log("Determined Format:", format);

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: "auto", // Let Cloudinary auto-detect the resource type
      format: format,
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error", error);
          reject(error);
        } else {
          console.log("Cloudinary upload result:", result);
          resolve(result);
        }
      }
    );

    stream.end(fileBuffer);
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
module.exports = { uploadCloudinary, deleteImgCloudinary, uploadToCloudinary };











// const cloudinary = require("cloudinary").v2;
// const dotenv = require("dotenv");

// // Load environment variables
// dotenv.config();

// // Cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // console.log("Cloudinary config:", cloudinary.config());

// const uploadCloudinary = (fileBuffer, mimeType, resourceType = "auto", folder = "") => {
//   const allowedTypes = [
//     'image/jpeg',
//     'image/png',
//     'application/pdf',
//     'application/epub+zip',
//     'application/vnd.amazon.ebook',
//     'audio/mpeg',
//     'video/mp4',
//     'video/mp3',
//   ];

//   if (!fileBuffer) {
//     return Promise.resolve(null); // Return a resolved promise with null if no fileBuffer
//   }

//   if (!allowedTypes.includes(mimeType)) {
//     return Promise.reject({ message: "Unsupported file type", mimeType });
//   }

//   return new Promise((resolve, reject) => {
//     const uploadOptions = {
//       resource_type: resourceType,
//     };
//     console.log("uploadOptions: ", uploadOptions);

//     if (folder) {
//       uploadOptions.folder = folder;
//     }

//     const stream = cloudinary.uploader.upload_stream(
//       // uploadOptions,
//       (error, result) => {
//         if (error) {
//           console.error("Cloudinary upload error", error);
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       }
//     );

//     stream.end(fileBuffer);
//   });
// };

// const deleteImgCloudinary = async (publicId) => {
//   try {
//     const response = await cloudinary.uploader.destroy(publicId);
//     console.log("deleteImg", response);
//     return response;
//   } catch (error) {
//     console.log("deleteIMGERROR", error);
//   }
// };

// module.exports = { uploadCloudinary, deleteImgCloudinary };



// // cloudinaryConfig.js
// const cloudinary = require('cloudinary').v2;
// const dotenv = require('dotenv');

// dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const allowedTypes = [
//   'image/jpeg',
//   'image/png',
//   'application/pdf',
//   'application/epub+zip',
//   'application/vnd.amazon.ebook',
//   'application/x-mobipocket-ebook',
//   'audio/mpeg',
//   'video/mp4',
//   'audio/wav',
//   'video/avi',
//   'application/x-bzip2',
// ];

// const uploadCloudinary = (fileBuffer, mimeType, resourceType = 'auto', folder = '') => {
//   if (!fileBuffer) {
//     return Promise.resolve(null);
//   }

//   if (!allowedTypes.includes(mimeType)) {
//     return Promise.reject({ message: 'Unsupported file type', mimeType });
//   }

//   // Determine the format based on mimeType
//   const format = mimeType.split('/')[1];

//   return new Promise((resolve, reject) => {
//     const uploadOptions = {
//       resource_type: resourceType, format: format, // Set the format explicitly
//     };

//     if (folder) {
//       uploadOptions.folder = folder;
//     }

//     const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
//       if (error) {
//         return reject(error);
//       }
//       resolve(result);
//     });

//     stream.end(fileBuffer);
//   });
// };

// const deleteImgCloudinary = async (publicId) => {
//   try {
//     const response = await cloudinary.uploader.destroy(publicId);
//     return response;
//   } catch (error) {
//     console.error('Error deleting image:', error);
//     throw error; // Re-throw to be caught in the calling function
//   }
// };

// module.exports = { uploadCloudinary, deleteImgCloudinary };










