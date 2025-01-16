import Listing from '../models/listing.model.js';
import { uploadOnCloudinary, deleteFileFromDisk } from '../utils/cloudinary.js';

// Create a new listing
export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(200).json(listing)
  } catch (error) {
    next(error)
  }
};

// Upload images and return the image URLs
export const imageUpload = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const imageUrls = [];
    for (const file of req.files) {
      const { path } = file;
      const cloudinaryResult = await uploadOnCloudinary(path);
      if (cloudinaryResult?.secure_url) {
        imageUrls.push(cloudinaryResult.secure_url); // Push image URLs to the array
      }
      await deleteFileFromDisk(path); // Clean up temp files
    }

    return res.status(200).json({ imageUrls });
  } catch (error) {
    next(error);
  }
};
