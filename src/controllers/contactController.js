const nodemailer = require("nodemailer");
const Contact = require("../models/Contact");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Use environment variable
    pass: process.env.EMAIL_PASS, // Use environment variable
  },
});

const sendEmail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    const mailOptions = {
      from: email, // Sender address
      to: process.env.EMAIL_USER, // Your email address
      subject: "New Contact Form Submission",
      text: `New message from ${name} (${email}): ${message}`,
      html: `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email." });
  }
};

module.exports = { sendEmail };
