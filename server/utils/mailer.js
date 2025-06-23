// utils/mailer.js

const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendThankYouEmail = async (to, campaignTitle, amount, pdfPath) => {
  const mailOptions = {
    from: `"GiveHeartedly" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🧾 Receipt for your donation to "${campaignTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Thank You for Your Donation! 🙏</h2>
        <p>Hi there,</p>
        <p>We’ve received your generous donation of <strong>$${amount}</strong> to <strong>${campaignTitle}</strong>.</p>
        <p>Your receipt is attached as a PDF for your reference.</p>
        <br/>
        <p>This is a test receipt for demonstration purposes only.</p>
        <p>– The GiveHeartedly Team</p>
      </div>
    `,
    attachments: [
      {
        filename: 'donation-receipt.pdf',
        path: pdfPath,
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendThankYouEmail };

console.log("✅ mailer.js loaded — sendThankYouEmail is ready");

