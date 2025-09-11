// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const cors = require('cors');
const app = express();
app.use(cors({
  origin: 'https://bhoomi-frontend-z582.vercel.app'
}));

app.use(bodyParser.json());

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// API endpoint to send SMS
app.post('/send-sms', (req, res) => {
  const { message, to } = req.body;

  client.messages.create({
    body: message,
    from: twilioNumber,
    to: to
  })
  .then(message => {
    console.log("Message sent:", message.sid);
    res.status(200).json({ success: true, sid: message.sid });
  })
  .catch(error => {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: error.message });
  });
});
app.post('/send-end-sms', (req, res) => {
  const { name, phone, estimatedTime, totalTime, landmarksCovered } = req.body;

  const endMessage = `Mr/Miss ${name}, phone number ${phone} is reaching in ${estimatedTime}. Total time taken to reach - ${totalTime}. Total landmarks covered ${landmarksCovered} /25.`;

  client.messages.create({
    body: endMessage,
    from: twilioNumber,
    to: phone // This is the user's number entered in the form
  })
  .then(message => {
    console.log("End message sent:", message.sid);
    res.status(200).json({ success: true, sid: message.sid });
  })
  .catch(error => {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: error.message });
  });
});
// API endpoint to send feedback SMS
app.post('/send-feedback', (req, res) => {
  const { name, phone, message } = req.body;

  // Prepare the feedback message
  const feedbackMessage = `Feedback from ${name} (${phone}):\n${message}`;

  // List of phone numbers to send feedback to
  const feedbackRecipients = ["+919444887887","+919444950950"]; // update with actual numbers

  // Send SMS to all recipients
  Promise.all(feedbackRecipients.map(toNumber =>
    client.messages.create({
      body: feedbackMessage,
      from: twilioNumber,
      to: toNumber
    })
  ))
  .then(results => {
    console.log("Feedback messages sent:", results.map(r => r.sid));
    res.status(200).json({ success: true });
  })
  .catch(error => {
    console.error("Error sending feedback SMS:", error);
    res.status(500).json({ success: false, error: error.message });
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running!");
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});








