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

// ✅ 1. Connect to DB
connectDB();

// ✅ 2. Trust proxy if deployed on Render/Cloud
app.set('trust proxy', 1); // ⬅️ Important for correct cookies on HTTPS

// ✅ 3. Body parsing middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ 4. CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://jobportal-frontend-mauve.vercel.app' // ⬅️ Replace with your actual Vercel URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('❌ Blocked CORS origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ 5. Session configuration (cross-origin cookies)
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
    secure: true,                // ⬅️ Must be true for HTTPS (Render uses HTTPS)
    sameSite: 'none',            // ⬅️ Required for cross-origin
    httpOnly: true               // ⬅️ Prevents client-side JS access
  }
}));

// ✅ 6. Routes
app.use('/', routesIndex);

// ✅ 7. Serve resume files
app.use('/resume', express.static(path.join(__dirname, 'uploads/cv')));

// ✅ 8. Test route
app.get('/', (req, res) => {
  res.send('✅ Backend is running and accepting requests');
});

// ✅ 9. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
