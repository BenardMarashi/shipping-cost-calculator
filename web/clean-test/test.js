// test.js
const express = require('express');
const app = express();
const PORT = 8081;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/health', (req, res) => {
  res.send('OK');
});

// The '0.0.0.0' here is important - it tells Express to listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Listening on all network interfaces`);
});