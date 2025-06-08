const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM = process.env.TWILIO_SMS_NUMBER; // מספר טלפון שמוגדר ל-SMS (לא וואטסאפ)
const BASE_URL = process.env.BASE_URL;

/**
 * שולח הודעת SMS עם קישורים לאישור וביטול
 * @param {string} to מספר טלפון של המשתמש (עם קידומת)
 * @param {number} meetingId מזהה מפגש
 * @param {number} registrationId מזהה רישום (לטובת קישורים)
 */
async function sendSmsWithConfirmLink(to, meetingId, registrationId) {
  const message = `✔️ התפנה מקום במפגש!\n\nלאישור:\n${BASE_URL}/participation/confirm/${registrationId}\n\nלביטול:\n${BASE_URL}/participation/decline/${registrationId}`;

  try {
    await client.messages.create({
      from: FROM,
      to: formatPhoneNumber(to), 
      body: message,
    });
    console.log(`הודעת SMS נשלחה אל ${to}`);
  } catch (err) {
    console.error('שגיאה בשליחת SMS:', err.message);
  }
}

function formatPhoneNumber(phone) {
  if (phone.startsWith('0')) {
    return '+972' + phone.slice(1);
  }
  if (!phone.startsWith('+')) {
    return '+' + phone;
  }
  return phone;
}

module.exports = { sendSmsWithConfirmLink };
