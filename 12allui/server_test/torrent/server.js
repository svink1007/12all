const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const WebTorrent = require('webtorrent');

const app = express();
const expressWs = require('express-ws')(app);

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());
app.ws('/ws', () => {});

const client = new WebTorrent();

client.on('error', (err) => console.error(err));

app.get('/torrent/:id/:index', (req, res) => {
  const {id, index} = req.params;

  if (!id || !index) {
    res.status(400).json({message: 'Provide infoHash and index'});
    return;
  }

  const torrent = client.get(id);

  if (!torrent) {
    res.status(404).json({message: 'Torrent not found'});
    return;
  }

  const file = torrent.files[index];

  const {range} = req.headers;
  const fileSize = file.length;
  const [rangeStart, rangeEnd] = range.replace(/bytes=/, '').split('-');
  const start = parseInt(rangeStart, 10)
  const end = rangeEnd
    ? parseInt(rangeEnd, 10)
    : fileSize - 1;

  const header = {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': (end - start) + 1
  };

  res.writeHead(206, header);

  const stream = file.createReadStream({start, end});
  stream.pipe(res);
});

app.post('/torrent', (req, res) => {
  const {body, files} = req;

  let torrentId = body.magnet;

  // Check if torrent file or magnet url is send
  if (!torrentId && files && files.torrent) {
    torrentId = files.torrent.data;
  }

  if (!torrentId) {
    res.status(400).json({message: 'Invalid torrent'});
    return;
  }

  const response = () => {
    const files = torrent.files
      .filter(({name}) => /.mp3|.wav|.mp4|.webm|.ogg$/.test(name))
      .map(({name}) => {
        const index = torrent.files.findIndex(t => t.name === name);
        return {name, index};
      });

    if (!files.length) {
      res.status(400).json({message: 'No compatible files'});
      return;
    }

    res.status(200).json({id: torrent.infoHash, files: files});
  };

  let torrent = client.get(torrentId);

  if (!torrent) {
    console.log('loading', torrentId);

    torrent = client.add(torrentId);
    torrent.on('metadata', () => {
      console.log('metadata');
      response();
    });
  } else {
    response();
  }

  // Send progress to websocket clients
  const ws = expressWs.getWss('/ws');

  const sendProgress = () => {
    ws.clients.forEach( (client) => {
      // Send message if client ws is open
      if (client.readyState === 1) {
        const data = JSON.stringify({id: torrent.infoHash, progress: torrent.progress});
        client.send(data);
      }
    });
  };

  // Listeners
  torrent.on('download', () => {
    sendProgress();
    console.log('download progress: ' + (torrent.progress * 100).toFixed(1) + '%');
  });

  torrent.on('done', () => {
    sendProgress();
    console.log('done progress: 100%');
  });

  torrent.on('error', (error) => {
    console.error(error);
    res.status(400).json({error});
  });
});

app.delete('/torrent', (req, res) => {
  const {body, files} = req;

  let torrentId = body.magnet;

  if (!torrentId && files && files.torrent) {
    torrentId = files.torrent.data;
  }

  if (!torrentId) {
    res.status(400).json({message: 'Invalid torrent'});
    return;
  }

  const torrentExist = client.get(torrentId);

  if (!torrentExist) {
    res.status(404).json({message: 'Torrent not found'});
    return;
  }

  client.remove(torrentId, () => {
    res.status(200).json({message: 'Torrent removed'});
  });
});

const port = 5000;

app.listen(port, () => console.log(`Server is listening on ${port}!`));
