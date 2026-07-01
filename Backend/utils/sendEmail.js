const nodemailer = require('nodemailer');

/**
 * Sends an email notification using configured SMTP settings or Ethereal/mock fallbacks.
 * @param {Object} options
 * @param {string} options.to Email address of the recipient
 * @param {string} options.subject Email subject
 * @param {string} options.text Plain text version of email
 * @param {string} options.html HTML version of email
 */
const sendEmail = async ({ to, subject, text, html }) => {
  // 1. Check if Brevo HTTP API is configured (Best for production deployment)
  if (process.env.BREVO_API_KEY) {
    console.log('📧 Using Brevo HTTP API to send email.');
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'CampusFlow', email: process.env.SMTP_USER || 'djivites@gmail.com' },
          to: [{ email: to }],
          subject: subject,
          textContent: text,
          htmlContent: html
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || JSON.stringify(data));
      }
      console.log(`✅ Email sent successfully via Brevo: ${data.messageId}`);
      return data;
    } catch (error) {
      console.error('❌ Error sending email via Brevo:', error);
      throw error;
    }
  }

  // 2. Check if Resend HTTP API is configured
  if (process.env.RESEND_API_KEY) {
    console.log('📧 Using Resend HTTP API to send email.');
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.SMTP_FROM || 'onboarding@resend.dev',
          to: [to],
          subject: subject,
          text: text,
          html: html
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || JSON.stringify(data));
      }
      console.log(`✅ Email sent successfully via Resend: ${data.id}`);
      return data;
    } catch (error) {
      console.error('❌ Error sending email via Resend:', error);
      throw error;
    }
  }

  // 3. Fallback: Check if SMTP details are configured in environment
  const isSmtpConfigured = 
    process.env.SMTP_HOST && 
    process.env.SMTP_PORT && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS;

  let transporter;

  if (isSmtpConfigured) {
    console.log('📧 Using configured SMTP settings to send email.');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    console.log('📧 SMTP settings not fully configured in .env. Attempting Ethereal test account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (err) {
      console.warn('⚠️ Failed to create Ethereal test account. Falling back to console logging.', err.message);
      // Fallback: Custom mock sendMail function log
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n==================================================');
          console.log('📧 [MOCK EMAIL NOTIFICATION]');
          console.log(`To:      ${mailOptions.to}`);
          console.log(`From:    ${mailOptions.from}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log('--------------------------------------------------');
          console.log(mailOptions.text);
          console.log('==================================================\n');
          return { messageId: 'mock-id-' + Date.now() };
        }
      };
    }
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || '"CampusFlow Notifications" <noreply@campusflow.com>',
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    
    // Log preview link if we used Ethereal
    if (nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info)) {
      console.log(`🔗 Ethereal Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
