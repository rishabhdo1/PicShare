require('dotenv').config(); 
const cors = require('cors')
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const postsRoutes = require('./routes/postsRoutes');
const app = express();
const port = 5000;

app.use(cors());

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);  
app.use('/posts', postsRoutes);


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
