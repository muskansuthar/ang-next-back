import express from 'express';
import nodemailer from "nodemailer";


const router = express.Router();


router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `${name} <${process.env.GMAIL_USER}>`,
      replyTo: email,
      to: process.env.GMAIL_USER,
      subject: `New Message from ${name}`,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #6c4722;">New Contact Message</h2>
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      </div>
    </div>`,
    });

    res.status(200).json({ error: false, msg: "Email sent successfully" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: true, msg: "Failed to send email" });
  }
});


export default router;