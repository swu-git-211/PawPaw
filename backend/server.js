require('dotenv').config();
const express = require('express');
const fs = require('fs');
const { readdirSync } = fs;
const morgan = require('morgan');
const cors = require('cors');
const bodyParse = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/user'); // Import userRoutes
const path = require('path');


dotenv.config();

// Express app
const app = express();

const jwtSecret = process.env.JWT_SECRET || 'defaultSecretKey';

app.use('/uploads', express.static(path.join(__dirname, '.', 'uploads')));

app.use(morgan('dev'));
app.use(cors({
    origin: 'http://3.214.235.164',
    credentials: true, // ให้แน่ใจว่า URL ตรงกับที่ frontend ใช้
}));

app.use(bodyParse.json({ limit: '10mb' }));

// Connect to database
connectDB();

//routes auto
//readdirSync('./routes').map((r) => app.use('/pawpaw', require('./routes/' + r)));

// Dynamically load routes
readdirSync(path.join(__dirname, 'routes')).forEach((file) => {
  const routePath = path.join(__dirname, 'routes', file);
  console.log(`Loading route: ${file}`);
  app.use('/pawpaw', require(routePath));
});


//เพื่อlike
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');

app.use('/pawpaw/posts', postRoutes);
app.use('/pawpaw/comments', commentRoutes);
  
// ตั้งค่าให้โฟลเดอร์ 'uploads' ของ backend สามารถเข้าถึงได้ผ่าน URL `/uploads`
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
