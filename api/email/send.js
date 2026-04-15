import nodemailer from "nodemailer";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

const templates = {
  hospital_registered: (d) => `<h2>Hospital Registered</h2><p>${d.name} in ${d.city} requested approval.</p>`,
  hospital_approved: (d) => `<h2>Hospital Approved</h2><p>${d.name} has been approved.</p>`,
  doctor_registered: (d) => `<h2>Doctor Registered</h2><p>${d.name} (${d.pmdc}) requested verification.</p>`,
  doctor_approved: (d) => `<h2>Doctor Approved</h2><p>${d.name} is now verified on PrivyHealth.</p>`,
  records_shared: (d) => `<h2>Records Shared</h2><p>${d.from} shared records with ${d.to} for ${d.purpose}.</p>`,
  emergency_accessed: (d) => `<h2>Emergency Access Alert</h2><p>Your emergency card was accessed by ${d.responder}.</p>`,
  prescription_filled: (d) => `<h2>Prescription Filled</h2><p>${d.code} marked dispensed by ${d.pharmacy}.</p>`
};

async function getTransport() {
  if (process.env.SMTP_HOST) {
    return {
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
      }),
      preview: null
    };
  }
  const test = await nodemailer.createTestAccount();
  return {
    transporter: nodemailer.createTransport({
      host: test.smtp.host,
      port: test.smtp.port,
      secure: test.smtp.secure,
      auth: { user: test.user, pass: test.pass }
    }),
    preview: "ethereal"
  };
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, data = {} } = req.body || {};
  if (!templates[type]) return res.status(400).json({ error: "Unsupported email type" });

  const to =
    type === "hospital_registered" || type === "doctor_registered"
      ? process.env.ADMIN_EMAIL || "admin@privyhealth.pk"
      : data.email || process.env.ADMIN_EMAIL || "admin@privyhealth.pk";

  const { transporter, preview } = await getTransport();
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER || "no-reply@privyhealth.pk",
    to,
    subject: `PrivyHealth Notification: ${type.replaceAll("_", " ")}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:auto;padding:24px;border:1px solid #dceee6;border-radius:14px;">
        <h1 style="color:#0d9373;margin:0 0 12px;">PrivyHealth Pakistan</h1>
        ${templates[type](data)}
        <p style="color:#5a7a6e;">Built for Entangled Hackathon 2026</p>
      </div>
    `
  });

  const previewUrl = preview ? nodemailer.getTestMessageUrl(info) : null;
  if (previewUrl) console.log("Ethereal preview:", previewUrl);
  return res.status(200).json({ ok: true, preview: previewUrl });
}
