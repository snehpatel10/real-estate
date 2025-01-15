import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';

// Load environment variables from .env file
dotenv.config();

// Validate environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Cloudinary credentials are missing in environment variables.');
  process.exit(1); // Stop the application if Cloudinary credentials are missing
}

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload the image to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null; // Ensure that the file path is provided

    // Upload the image to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // Auto-detect file type (image, video, etc.)
    });

    // Return the Cloudinary response containing image info
    return {
      secure_url: response.secure_url, // Cloudinary URL for the image
      public_id: response.public_id, // Public ID if needed for future reference
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    if (await fileExists(localFilePath)) {
      await deleteFileFromDisk(localFilePath); // Delete the file from disk after failure
    }
    return null;
  }
};

// Helper function to check if file exists
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath); // Check if file exists
    return true;
  } catch {
    return false;
  }
};

// Function to delete file from disk after upload
const deleteFileFromDisk = async (filePath) => {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file from disk:', error);
    }
  };

export { uploadOnCloudinary, deleteFileFromDisk };
