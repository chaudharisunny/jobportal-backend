require("dotenv").config();
const express = require('express');
const connectDB = require('./config');
const cors = require('cors');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const routesIndex = require('./routes/index');

// ✅ 1. Connect to MongoDB
connectDB();

// ✅ 2. Trust proxy (needed for secure cookies on HTTPS hosts like Render)
app.set('trust proxy', 1);

// ✅ 3. Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ 4. CORS fix (only allow your frontend domain, not '*')
app.use(cors({
  origin: 'https://jobportal-frontend-mauve.vercel.app', // ✅ your actual Vercel frontend URL
  credentials: true
}));

// ✅ 5. Session config for cross-origin cookie handling
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: true,                // ✅ required for HTTPS
    sameSite: 'none',            // ✅ required for cross-origin
    httpOnly: true               // ✅ secure from JavaScript access
  }
}));

// ✅ 6. Test route
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// ✅ 7. App routes
app.use('/', routesIndex);

// ✅ 8. Serve uploaded resume files
app.use('/resume', express.static(path.join(__dirname, 'uploads/cv')));

// ✅ 9. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server is running on port ${PORT}`)
);
