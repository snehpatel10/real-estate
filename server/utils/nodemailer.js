import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Replace with your Gmail address
    pass: process.env.EMAIL_PASS // Replace with your Gmail App Password
  }
});

export default transporter;
