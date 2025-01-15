import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary, deleteFileFromDisk } from "../utils/cloudinary.js";

export const test = (req, res) => {
  res.send("Hello World!");
};

export const updateUser = async (req, res, next) => {
  try {
    // Verify authorization - the user can only update their own account
    if (req.user.id !== req.params.id) {
      return next(errorHandler(401, "You can only update your own account"));
    }

    // Hash the password if it is being updated
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    // Check if the email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });

    if (existingUser && existingUser._id.toString() !== req.params.id) {
      if (existingUser.email === req.body.email) {
        return next(errorHandler(409, "This email is already registered."));
      }
      if (existingUser.username === req.body.username) {
        return next(errorHandler(409, "This username is already taken."));
      }
    }

    // Handle avatar upload (if provided)
    if (req.file) {
      // Upload the new avatar to Cloudinary
      const cloudinaryResult = await uploadOnCloudinary(req.file.path);
      if (cloudinaryResult) {
        req.body.avatar = cloudinaryResult.secure_url;
        
        // Delete the local avatar file from the public/temp folder after upload
        await deleteFileFromDisk(req.file.path);
        
        // Optionally, delete the old avatar if it exists in Cloudinary (and if there is one)
        if (req.user.avatar) {
          const oldAvatarPublicId = req.user.avatar.split('/').pop().split('.')[0]; // Extract public ID from URL
          await cloudinary.uploader.destroy(oldAvatarPublicId);  // Delete the old avatar from Cloudinary
        }
      }
    }

    // Perform the update in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    // Exclude the password from the response
    const { password, ...rest } = updatedUser._doc;

    // Send the updated user info as a response
    res.status(200).json({ success: true, user: rest });
  } catch (error) {
    // Handle MongoDB unique field error (e.g., email or username already taken)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(
        errorHandler(409, `The ${field} is already in use. Please choose another.`)
      );
    }
    next(error); // Pass error to the error handling middleware
  }
};



export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only delete your own account"));
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Clear the cookie before sending the response
    res.clearCookie('access_token');

    // Send a proper JSON response
    return res.status(200).json({ message: "User has been deleted" });
  } catch (error) {
    next(error);  // Pass error to the error handling middleware
  }
};

