const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

console.log('Listening express on 0.0.0.0:8080')
app.listen(8080, '0.0.0.0');