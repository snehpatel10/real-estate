import Listing from '../models/listing.model.js';
import { uploadOnCloudinary, deleteFileFromDisk } from '../utils/cloudinary.js';

// Create a new listing
export const createListing = async (req, res, next) => {
  try {
    const { name, description, address, regularPrice, discountPrice, bedrooms, bathrooms, furnished, parking, type, offer, userRef } = req.body;

    const newListing = await Listing.create({
      name,
      description,
      address,
      regularPrice,
      discountPrice,
      bedrooms,
      bathrooms,
      furnished,
      parking,
      type,
      offer,
      userRef
    });

    return res.status(200).json(newListing); // Return the created listing
  } catch (error) {
    next(error); // Error handling middleware
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
