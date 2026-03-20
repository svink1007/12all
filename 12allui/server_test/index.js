const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const https = require('https');
const fs = require('fs');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.post('/fb', (req, res) => {
  console.log(res);

  res.status(200).json({status: 'Not notified'});
});

const httpPort = 5000;
const httpsPort = 5001;

const httpServer = http.createServer(app);
const httpsServer = https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app);

httpServer.listen(httpPort, () => console.log(`Http server started on port ${httpPort}`));
httpsServer.listen(httpsPort, () => console.log(`Https  server started on port ${httpsPort}`));
