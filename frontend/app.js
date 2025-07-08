const express = require('express');
const path = require('path');

const app = express();
const PORT = 4000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'front.html'));
  });
  app.get('/post', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'posts.html'));
  });

  app.use(express.static(path.join(__dirname, 'public'), { 
    setHeaders: (res, path, stat) => {
      if (path.endsWith('.css')) {
        res.set('Content-Type', 'text/css');
      }
    }
  }));
app.listen(PORT, () => {
  console.log(`Frontend Server is running on port ${PORT}`);
});
