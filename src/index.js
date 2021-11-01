const express = require('express');

const router = require('./routes');

const PORT = 8000;

const app = express();

app.get('/', (req, res) => {
  res.json({
    status: 'OK'
  })
});

app.use(router);

app.listen(PORT, () => {
  console.log('Server is running at ' + PORT);
})