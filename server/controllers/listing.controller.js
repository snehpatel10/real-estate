import Listing from '../models/listing.model.js';
import mongoose from 'mongoose';
import { uploadOnCloudinary, deleteFileFromDisk } from '../utils/cloudinary.js';
import { errorHandler } from '../utils/error.js';

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

export const deleteListing = async(req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if(!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  if(req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id)
    res.status(200).json('Listing has been deleted')
  } catch (error) {
    next(error)
  }
}

export const updateListing = async(req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorHandler(400, 'Invalid Listing ID!'));
  }

  const listing = await Listing.findById(req.params.id);
  if(!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  if(req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listing!'))
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new: true}
    );
    res.status(200).json(updatedListing)
  } catch (error) {
    next(error)
  }

}
