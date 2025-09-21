const twilio = require('twilio');
const meetingModel = require('../models/meeting_M');
require('dotenv').config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM = process.env.TWILIO_SMS_NUMBER;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4060';

async function sendSmsWithConfirmLink(to, meetingId, registrationId) {
  try {
    const [[meeting]] = await meetingModel.getById(meetingId);
    if (!meeting) {
        console.error(`Could not find meeting with ID ${meetingId} to send SMS.`);
        return;
    }

    const meetingDate = new Date(meeting.date).toLocaleDateString('he-IL', {day: '2-digit', month: '2-digit', year: 'numeric'});
    const meetingTime = meeting.start_time.slice(0, 5);

    const message = `היי! התפנה מקום בשיעור שרצית:
✨ שיעור: ${meeting.name}
👤 מאמן/ת: ${meeting.trainerName}
📅 תאריך: ${meetingDate}
⏰ שעה: ${meetingTime}

לאישור ההרשמה לחץ כאן:
${SERVER_URL}/api/participants/confirm/${registrationId}

לוויתור על המקום:
${SERVER_URL}/api/participants/decline/${registrationId}`;

    await client.messages.create({
      from: FROM,
      to: formatPhoneNumber(to), 
      body: message,
    });
    console.log(`הודעת SMS מפורטת נשלחה אל ${to}`);
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