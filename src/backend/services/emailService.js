import { Resend } from 'resend';

let resend = null;

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      resend = new Resend(apiKey);
    } else {
      console.warn('⚠️ RESEND_API_KEY not set - email sending disabled');
      return null;
    }
  }
  return resend;
}

export async function sendWelcomeEmail({ name, email, cardNumber }) {
  const emailClient = getResend();
  if (!emailClient) return console.log('Email skipped (no API key)');
  
  await emailClient.emails.send({
    from: 'מועדון היתרון <onboarding@resend.dev>',
    to: email,
    reply_to: 'noreply@hayitron.co.il',
    subject: 'ברוכים הבאים למועדון היתרון! 🎉',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #171B2E;">ברוכים הבאים למועדון היתרון!</h1>
        <p style="font-size: 16px;">שלום <strong>${name}</strong>,</p>
        <p style="font-size: 16px;">ההרשמה שלך הושלמה בהצלחה 🎉</p>
        <div style="background: #F8F6F0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #555;">מספר כרטיס:</p>
          <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: #C9A050; letter-spacing: 2px;">${cardNumber}</p>
        </div>
        <p style="font-size: 16px;">כעת תוכלי ליהנות מכל הטבות המועדון באלפי בתי עסק ברחבי הארץ.</p>
        <p style="color: #888; font-size: 13px; margin-top: 30px;">מועדון היתרון — כי אתם מגיעים ליותר</p>
      </div>
    `,
  });
}

export async function sendBulkBroadcast({ recipients, subject, body }) {
  const emailClient = getResend();
  if (!emailClient) {
    return {
      delivered: 0,
      skipped: recipients.length,
      provider: 'disabled',
    };
  }

  if (!recipients.length) {
    return {
      delivered: 0,
      skipped: 0,
      provider: 'resend',
      result: null,
      providerError: null,
    };
  }

  try {
    const result = await emailClient.emails.send({
      from: 'מועדון היתרון <onboarding@resend.dev>',
      to: recipients,
      reply_to: 'noreply@hayitron.co.il',
      subject,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #171B2E; margin-bottom: 16px;">${subject}</h1>
          <div style="font-size: 16px; line-height: 1.7; color: #1f2740; white-space: pre-wrap;">${body}</div>
          <p style="color: #888; font-size: 13px; margin-top: 32px;">נשלח ממערכת הניהול של מועדון היתרון</p>
        </div>
      `,
    });

    return {
      delivered: recipients.length,
      skipped: 0,
      provider: 'resend',
      result,
      providerError: null,
    };
  } catch (error) {
    return {
      delivered: 0,
      skipped: recipients.length,
      provider: 'resend',
      result: null,
      providerError: error?.message || 'Unknown resend error',
    };
  }
}
