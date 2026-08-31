import nodemailer from "nodemailer";

export const sendVerificationOTP = async (email: string, otp: string) => {
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: `
            <h2>Email Verification</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP expires in 5 minutes.</p>
        `,
  });

  console.log("✅ Email sent");
};

export const sendInterviewReminderEmail = async (
  email: string,
  interviewTitle: string,
  scheduledAt: Date,
  duration: number,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Interview Reminder: ${interviewTitle}`,
    html: `
      <h2>Interview Reminder</h2>

      <p>Your interview is scheduled soon.</p>

      <p>
        <strong>Interview:</strong> ${interviewTitle}
      </p>

      <p>
        <strong>Scheduled at:</strong>
        ${scheduledAt.toLocaleString()}
      </p>

      <p>
        <strong>Duration:</strong>
        ${duration} minutes
      </p>

      <p>
        Please join a few minutes before your scheduled time.
      </p>
    `,
  });

  console.log(
    `✅ Interview reminder sent to ${email}`,
  );
};

