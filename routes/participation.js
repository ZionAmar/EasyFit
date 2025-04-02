const express = require('express');
const router = express.Router();
const { joinMeeting, joinWaiting, cancelParticipation, getUserMeetings } = require('../middleware/participationMid');

router.post('/join', joinMeeting, (req, res) => {
  if (req.error) return res.status(req.error.status).json({ error: req.error.message });

  res.send('הצטרפת בהצלחה למפגש.');
});

router.post('/join-waiting', joinWaiting, (req, res) => {
  if (req.error) return res.status(req.error.status).json({ error: req.error.message });

  res.send('נוספת לרשימת המתנה בהצלחה.');
});

// הצגת כל המפגשים של משתמש מסוים עם הסטטוס
router.get('/my-meetings/:user_id', getUserMeetings, (req, res) => {
    if (req.error) {
      return res.status(req.error.status).render('error', {
        title: 'שגיאה',
        message: req.error.message
      });
    }
  
    res.render('myMeetings', {
      title: 'המפגשים שלי',
      header: 'רשימת המפגשים שלך',
      meetings: req.userMeetings,
      userId: req.params.user_id
    });
  });
  
// ביטול הצטרפות
router.post('/cancel', cancelParticipation, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).json({ error: req.error.message });
    }

    res.send('ביטלת את ההשתתפות בהצלחה.');
});

module.exports = router;
