const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
const interviewRoutes = require('./routes/interview');
app.use('/interview', interviewRoutes);
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
