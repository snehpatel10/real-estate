import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export const uploadOnCloudinary = async (localFilePath, folderName = 'listings') => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // Auto-detect file type (image, video, etc.)
      folder: folderName, // Specify folder
    });

    return {
      secure_url: response.secure_url, // Cloud URL for the image
      public_id: response.public_id, // Public ID to reference image
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    await deleteFileFromDisk(localFilePath); // Delete temp file on failure
    return null;
  }
};

// Helper function to check if file exists
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

// Function to delete temp files after upload
export const deleteFileFromDisk = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file from disk:', error);
  }
};
