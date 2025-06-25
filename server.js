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

const isProduction = process.env.NODE_ENV === 'production';

// ✅ 1. Connect to MongoDB
connectDB();

// ✅ 2. Trust proxy (needed for secure cookies on HTTPS hosts like Render)
app.set('trust proxy', 1);

// ✅ 3. Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://localhost:5173',
  'https://jobportal-frontend-mauve.vercel.app'
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

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});


// ✅ 8. Serve uploaded resume files
app.use('/resume', express.static(path.join(__dirname, 'uploads/cv')));

// ✅ 9. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server is running on port ${PORT}`)
);
