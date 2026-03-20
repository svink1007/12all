const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(bodyParser.json());

const publicVapidKey = 'BJthRQ5myDgc7OSXzPCMftGw-n16F7zQBEN7EUD6XxcfTTvrLGWSIG7y_JxiWtVlCFua0S8MTB5rPziBqNx1qIo';
const privateVapidKey = '3KzvKasA2SoCxsp0iIG_o9B0Ozvl1XDwI63JRKNIWBM';

webpush.setVapidDetails(
  'mailto:test@test.com',
  publicVapidKey,
  privateVapidKey
);

let subscriber = null;

app.get('/notifications/subscribed', (req, res) => {
  let output = [];
  if (subscriber) {
    output = subscriber.types;
  }
  res.status(200).json(output);
});


app.post('/notifications/subscribe', (req, res) => {
  if (!subscriber || !subscriber.types.length) {
    subscriber = {subscription: req.body.subscription, types: []};
  }

  if (req.body.type === 'all') {
    subscriber.types = ['offers', 'subscriptionPlan', 'newSeries', 'liveTvEvents', 'upcomingOffers', 'reminders'];
  } else {
    subscriber.types.push(req.body.type);
  }

  res.status(200).json({status: 'Subscribed'});
});

app.post('/notifications/unsubscribe', (req, res) => {
  subscriber.types = subscriber.types.filter(type => type !== req.body.type);

  res.status(200).json({status: `Unsubscribed from ${req.body.type}`});
});

app.post('/notifications/push', (req, res) => {

  const {title, description, url} = req.body;
  // Create payload
  const payload = JSON.stringify({title, description, url});

  if (subscriber.types.indexOf(req.body.type) !== -1) {
    webpush
      .sendNotification(subscriber.subscription, payload)
      .catch(err => console.error(err));

    res.status(200).json({status: 'Notified'});
  } else {
    // Send 200 - OK
    res.status(200).json({status: 'Not notified'});
  }
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
