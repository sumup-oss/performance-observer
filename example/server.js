/* eslint-disable */

const path = require('path');
const express = require('express');

const port = process.env.PORT || 6789;
const app = express();

const asyncResponse = (req, done) => {
  const delay = Number(req.query.delay || 0);

  setTimeout(() => done(), delay);
};

app.get('/favicon.ico', (req, res) => res.sendStatus(204));

app.get('/script.js', (req, res) => {
  asyncResponse(req, () => {
    res.sendFile(path.resolve(__dirname, './script.js'));
  });
});

app.get('/image.png', (req, res) => {
  asyncResponse(req, () => {
    res.sendFile(path.resolve(__dirname, './image.png'));
  });
});

app.get('/', (req, res) => {
  asyncResponse(req, () => {
    res.setHeader('Server-Timing', 'redis;dur=53, proxy-api;dur=247.2');
    res.sendFile(path.resolve(__dirname, './index.html'));
  });
});

app.listen(port, () => {
  console.log('performance-observer example server started on port %s', port);
});
