import nodemailer from "nodemailer";

const createTransporter = () => {
const { SMTP_HOST, SMTP_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

if (!SMTP_HOST || !SMTP_PORT || !EMAIL_USER || !EMAIL_PASS) {
throw new Error(
"Email service is not configured. Please configure the SMTP environment variables."
);
}

return nodemailer.createTransport({
host: SMTP_HOST,
port: Number(SMTP_PORT),
secure: Number(SMTP_PORT) === 465,
auth: {
user: EMAIL_USER,
pass: EMAIL_PASS,
},
});
};

export const sendAdminOtpEmail = async (email, otp) => {
const transporter = createTransporter();

await transporter.sendMail({
from: `"Jashna Edu" <${process.env.EMAIL_USER}>`,
to: email,
subject: "Jashna Edu Admin Password Change Verification",

text: [
  "Hello,",
  "",
  "We received a request to change your Jashna Edu admin account password.",
  `Your verification code is: ${otp}`,
  "",
  "This code expires in 10 minutes.",
  "If you did not request this change, you can ignore this email.",
  "",
  "Jashna Edu",
].join("\n"),

html: `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; color: #102B4E;">
    <h2>Jashna Edu</h2>
    <h3>Admin Password Verification</h3>

    <p>We received a request to change your admin account password.</p>
    <p>Your verification code is:</p>

    <div style="font-size: 30px; font-weight: bold; letter-spacing: 8px; padding: 16px; background: #F8F6EF; text-align: center;">
      ${otp}
    </div>

    <p>This code expires in <strong>10 minutes</strong>.</p>
    <p>If you did not request this change, you can safely ignore this email.</p>

    <hr />

    <p style="font-size: 12px; color: #666;">
      Jashna Edu · Admin Account Security
    </p>
  </div>
`,

});
};