const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.post('/contact-us', (req, res) => {
  const {from, message, subject} = req.body;

  const main = async () => {
    const us = 'hello@12all.tv';

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      auth: {
        user: us,
        pass: 'rcMvki4KZM?-M9ny',
      },
    });

    const mailOptions = {
      to: us,
      subject,
      text: `From: ${from}\n\n${message}`
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error', error);
        res.status(400).json({status: 'Email not sent'});
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).json({status: 'Email sent'});
      }
    });
  };

  main().catch((err) => {
    console.log('Catch', err)
    res.status(400).json({status: 'Email not sent'});
  });
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
