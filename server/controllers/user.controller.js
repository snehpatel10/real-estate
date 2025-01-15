import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

export const test = (req, res) => {
  res.send("Hello World!");
};

export const updateUser = async (req, res, next) => {
  try {
    // Verify if the user is authorized to update their account
    if (req.user.id !== req.params.id) {
      return next(errorHandler(401, "You can only update your own account"));
    }

    // Hash the password if it is being updated
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

    // Perform the update
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true } // Ensure the update is validated
    );

    // If user not found
    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    // Exclude the password from the response
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json({ success: true, rest });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(
        errorHandler(409, `The ${field} is already in use. Please choose another.`)
      );
    }
    next(error); // Pass other errors to error-handling middleware
  }
};


export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only delete your own account"));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted").clearCookie('access_token');
  } catch (error) {
    next(error);
  }
};
