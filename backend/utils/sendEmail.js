const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // If no real email is configured in .env, use a test Ethereal account
  let transporter;
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Create test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log("[EMAIL] Using Ethereal test email account");
  }

  const mailOptions = {
    from: `"Hostel Portal" <${process.env.EMAIL_FROM || "no-reply@hostelportal.com"}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (!process.env.EMAIL_USER) {
    console.log("[EMAIL] Message sent: %s", info.messageId);
    console.log("[EMAIL] 🌐 Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;
