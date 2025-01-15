import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

export const test = (req, res) => {
  res.send("Hello World!");
};

export const updateUser = async (req, res, next) => {
  try {
    // Verify authorization
    if (req.user.id !== req.params.id) {
      return next(errorHandler(401, "You can only update your own account"));
    }

    // Hash the password if being updated
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    // Check for duplicate email or username
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

    // Handle avatar update (if provided)
    if (req.body.avatar) {
      // Optionally, validate if the provided URL is valid or delete the old avatar
    }

    // Perform the update
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json({ success: true, rest });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(
        errorHandler(409, `The ${field} is already in use. Please choose another.`)
      );
    }
    next(error);
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

