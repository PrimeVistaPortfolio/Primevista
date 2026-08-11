const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null; // email is optional; no-op if unconfigured

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.warn("[email] SMTP not configured, skipping send:", subject);
    return { skipped: true };
  }
  return t.sendMail({
    from: process.env.EMAIL_FROM || "no-reply@primevista.dev",
    to,
    subject,
    html,
    text,
  });
}

async function notifyAdminOfInquiry(inquiry) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return { skipped: true };
  return sendMail({
    to: adminEmail,
    subject: `New inquiry from ${inquiry.name}`,
    html: `
      <h2>New website inquiry</h2>
      <p><b>Name:</b> ${inquiry.name}</p>
      <p><b>Email:</b> ${inquiry.email}</p>
      <p><b>Phone:</b> ${inquiry.phone || "-"}</p>
      <p><b>Company:</b> ${inquiry.company || "-"}</p>
      <p><b>Budget:</b> ${inquiry.budgetRange || "-"}</p>
      <p><b>Service interest:</b> ${inquiry.serviceInterest || "-"}</p>
      <p><b>Message:</b><br/>${inquiry.message}</p>
    `,
  });
}

async function sendInquiryConfirmation(inquiry) {
  return sendMail({
    to: inquiry.email,
    subject: "We received your inquiry",
    html: `
      <p>Hi ${inquiry.name},</p>
      <p>Thanks for reaching out — we've received your message and will get back to you shortly.</p>
      <p>— PrimeVista Technologies</p>
    `,
  });
}

module.exports = { sendMail, notifyAdminOfInquiry, sendInquiryConfirmation };
