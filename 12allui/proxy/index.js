const express = require('express');
const path = require('path');
const fs = require('fs');
const fsPromise = fs.promises;
const constants = require('./constants');
const db = require('./db');
const axios = require('axios');

// If you are about to change the port, don't forget to change it as well in the ui package.json
const PORT = 3000;
const DEFAULT_TITLE = '12all.tv';
const DEFAULT_LOGO = 'https://12all.tv/assets/icon/icon.png';
const DEFAULT_DESCRIPTION = 'Welcome to the first real social TV sharing company, allow users to share their TV with other users around the world.';
const INDEX_PATH = path.resolve(__dirname, '..', 'build', 'index.html');

const replaceHtmlTags = (htmlData, title, description, logo) => (
  htmlData
    .replace(new RegExp(`(<meta content=")(${DEFAULT_LOGO})(" name="image"/>)`), `$1${logo}$3`)
    .replace(new RegExp(`(<meta content=")(${DEFAULT_LOGO})(" property="og:image"/>)`), `$1${logo}$3`)
    .replace(new RegExp(`(<meta content=")(${DEFAULT_LOGO})(" property="twitter:image"/>)`), `$1${logo}$3`)
    .replace(new RegExp(`(<meta content=")(${DEFAULT_TITLE})(" name="title"/>)`), `$1${title}$3`)
    .replace(new RegExp(`(<meta content=")(${DEFAULT_TITLE})(" property="og:title"/>)`), `$1${title}$3`)
    .replace(new RegExp(`(<meta content=")(${DEFAULT_TITLE})(" property="twitter:title"/>)`), `$1${title}$3`)
    .replace(new RegExp(`(<meta content=")(${DEFAULT_DESCRIPTION})(" name="description"/>)`), `$1${description}$3`)
    .replace(new RegExp(`(<meta content=")(${DEFAULT_DESCRIPTION})(" property="twitter:description"/>)`), `$1${description}$3`)
    .replace(new RegExp(`(<meta content=")(${DEFAULT_DESCRIPTION})(" property="og:description"/>)`), `$1${description}$3`)
);

const app = express();

app.use(express.static(path.resolve(__dirname, '..', 'build')));

const streamHandler = async (req, res, next) => {
  try {
    const htmlData = await fsPromise.readFile(INDEX_PATH, 'utf8');

    let streamTitle = DEFAULT_TITLE,
      streamLogo = DEFAULT_LOGO,
      streamDescription = DEFAULT_DESCRIPTION;

    if (req.params.id) {
      const queryStreamName = `select s.name from shared_streams s where s.id = ${req.params.id}`;
      const rowsStream = await db.query(queryStreamName);
      if (rowsStream.length) {
        const {name} = rowsStream[0];
        streamTitle = `${name} | 12all`;
        streamDescription = `Watch live ${name} together with your friends`;

        const queryStreamLogo = `select u.hash, u.ext from upload_file_morph m
                                 join upload_file u on m.upload_file_id = u.id
                                 where m.related_type = 'shared_streams' and m.order = 1 and m.related_id = ${req.params.id}`;
        const rowsLogo = await db.query(queryStreamLogo);
        if (rowsLogo.length) {
          const {hash, ext} = rowsLogo[0];
          streamLogo = `${constants.webUrl}/meta-logo/${hash}${ext}`;
        }
      }

      const htmlDataWithReplacedTags = replaceHtmlTags(htmlData, streamTitle, streamDescription, streamLogo);
      res.send(htmlDataWithReplacedTags);
    } else {
      res.send(htmlData);
    }
  } catch (e) {
    console.error(e);
    next();
  }
};

app.get('/stream/:id/:roomId', streamHandler);

app.get('/stream/:id', streamHandler);

app.get('/watch-party/:id', async (req, res, next) => {
  try {
    const htmlData = await fsPromise.readFile(INDEX_PATH, 'utf8');

    let vlrTitle = DEFAULT_TITLE,
      vlrLogo = DEFAULT_LOGO,
      vlrDescription = DEFAULT_DESCRIPTION;

    if (req.params.id) {
      const rows = await db.query(`select c.description, c.name, c.logo from vlrs v join channels c on v.channel = c.id where v.public_id = '${req.params.id}'`);
      if (rows.length) {
        const {name, description, logo} = rows[0];
        vlrTitle = `${name} | 12all`;
        vlrDescription = description || `Join ${name}`;
        if (logo) {
          const logoSplit = logo.split('uploads/');
          if (logoSplit.length === 2) {
            vlrLogo = `${constants.webUrl}/meta-logo/${logoSplit[1]}`;
          }
        }
      }

      const htmlDataWithReplacedTags = replaceHtmlTags(htmlData, vlrTitle, vlrDescription, vlrLogo);
      res.send(htmlDataWithReplacedTags);
    } else {
      res.send(htmlData);
    }
  } catch (e) {
    console.error(e);
    next();
  }
});

app.get('/meta-logo/:name', async (req, res) => {
  try {
    const {name} = req.params;
    const filePath = path.join(__dirname, `./uploads/logos/${name}`);
    if (!fs.existsSync(filePath)) {
      const url = `${constants.cmsUrl}/uploads/${name}`;
      const config = {responseType: 'arraybuffer'};
      const {data} = await axios.get(url, config);
      if (!data) {
        res.status(400).send('Image not found');
        return;
      }
      await fsPromise.writeFile(filePath, data);
    }
    res.sendFile(filePath);
  } catch (e) {
    console.error(e.message);
    res.status(500).send(e.message);
  }
});

app.get('/*', async (req, res) => {
  const htmlData = await fsPromise.readFile(INDEX_PATH, 'utf8');
  res.send(htmlData);
});

app.listen(PORT, (error) => {
  if (error) {
    return console.log('Error during app startup', error);
  }
  console.log(`Listening on ${PORT}...`);
});
