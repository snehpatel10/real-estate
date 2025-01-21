import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../utils/nodemailer.js";

dotenv.config();

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;
  
    try {
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return next(errorHandler(409, "Email is already in use"));
      }
  
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        return next(errorHandler(450, "Username is already taken"));
      }
      const hashedPassword = bcryptjs.hashSync(password, 10);
  
      const newUser = new User({
        username,
        email,
        password: hashedPassword
      });
  
      await newUser.save();
      res.status(201).json("User created successfully");
    } catch (error) {
      next(error);
    }
  };

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "Invalid credentials"));
    }
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: userPassword, ...userWithoutPassword } = validUser._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 10000),
      })
      .status(200)
      .json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const google = async(req, res, next) => {
  try {
    const user = await User.findOne({ email:req.body.email })
    if(user){
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res
      .cookie("access_token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 10000),
      })
      .status(200)
      .json(rest);
    }
    else{
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10)
      const newUser = new User({ username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4), email: req.body.email, password: hashedPassword, avatar: req.body.photo });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const {password: pass, ...rest} = newUser._doc
      res
      .cookie("access_token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 10000),
      })
      .status(200)
      .json(rest);
    }
  } catch (error) {
    next(error)
  }
}

export const signout = async (req, res, next) => {
  try {
    res.clearCookie('access_token').status(200).json({ success: true, message: "Successfully signed out" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(errorHandler(404, 'User not found'))
    }

    // Generate the JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m", // Token expires in 10 minutes
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const mailOptions = {
      from: '"TrueHomes Support" <your-email@gmail.com>', // A more professional "from" name
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <p>Hi,</p>
          <p>You requested a password reset for your account. Click the button below to reset your password. The link will expire in <strong>10 minutes</strong>.</p>
          <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>If you did not request this, please ignore this email.</p>
          <hr>
          <p style="font-size: 12px;">If you no longer wish to receive emails, <a href="unsubscribe-link">unsubscribe here</a>.</p>
        </div>
      `,
    };
    
    
    

    // Send the reset email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Check your email for the reset link",
    });
  } catch (error) {
    next(error)
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;  // Get token from URL
  const { newPassword } = req.body;  // Get the new password from the body

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from the token's payload
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password before saving it
    const hashedPassword = bcryptjs.hashSync(newPassword, 10);  // Hash the password with 10 salt rounds

    // Update the user's password with the hashed password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};


