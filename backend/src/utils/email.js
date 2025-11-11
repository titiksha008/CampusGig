import nodemailer from 'nodemailer';
import 'dotenv/config';

let transporter = null;
let isVerified = false;

// Create transporter with retry mechanism
function createTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER and EMAIL_PASS must be set in .env file');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5
    });
}

// Initialize and verify transporter
async function initializeTransporter() {
    try {
        if (!transporter) {
            transporter = createTransporter();
        }

        if (!isVerified) {
            await transporter.verify();
            isVerified = true;
            console.log('✅ Email transporter verified and ready');
        }

        return true;
    } catch (err) {
        console.error('❌ Email transporter error:', err.message);
        isVerified = false;
        transporter = null;
        throw err;
    }
}

// Initialize on startup
initializeTransporter().catch(err => {
    console.error('Initial email setup failed:', err.message);
});

// ===============================
//  ✨ PROFESSIONAL HTML TEMPLATE
// ===============================
function generateEmailTemplate({ title, message, buttonText, buttonUrl }) {
    return `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px;">
        <table align="center" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <tr>
                <td style="text-align: center; padding: 30px 20px;">
                    <img src="https://i.ibb.co/sbCTs2r/campusgig-logo.png" alt="CampusGig Logo" style="width: 80px; height: auto; margin-bottom: 15px;" />
                    <h2 style="color: #111827; font-size: 24px; margin: 10px 0;">${title}</h2>
                </td>
            </tr>
            <tr>
                <td style="padding: 0 40px 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                    ${message}
                    ${
                        buttonText && buttonUrl
                            ? `
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${buttonUrl}" 
                            style="display: inline-block; padding: 12px 28px; 
                                   background-color: #2563eb; color: #ffffff; 
                                   text-decoration: none; border-radius: 8px; 
                                   font-weight: 600; letter-spacing: 0.3px;">
                            ${buttonText}
                        </a>
                    </div>` : ''
                    }
                </td>
            </tr>
            <tr>
                <td style="background-color: #f3f4f6; text-align: center; padding: 15px 10px; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 13px; color: #6b7280; margin: 0;">
                        &copy; ${new Date().getFullYear()} CampusGig. All rights reserved.<br>
                        <a href="https://campusgig.example.com" style="color: #2563eb; text-decoration: none;">Visit our website</a>
                    </p>
                </td>
            </tr>
        </table>
    </div>`;
}

// =====================================
//  ✉️ UNIVERSAL EMAIL SENDER FUNCTION
// =====================================
export async function sendEmail(to, subject, text, options = {}) {
    try {
        await initializeTransporter();

        if (!to || !subject) {
            throw new Error('Email recipient and subject are required');
        }

        const html = generateEmailTemplate(options);

        console.log(`📧 Sending email to ${to}`);
        const info = await transporter.sendMail({
            from: `"CampusGig" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text: text || options.message?.replace(/<[^>]*>?/gm, ''), // fallback plain text
            html,
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            }
        });

        console.log('✅ Email sent:', info.messageId);
        return info;
    } catch (err) {
        console.error('❌ Email send failed:', err.message);
        isVerified = false;
        throw err;
    }
}
