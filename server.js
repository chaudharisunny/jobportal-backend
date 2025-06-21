require("dotenv").config()
const express = require('express')
const connectDB = require('./config')
const cors=require('cors')
const app = express()
const path=require('path')
const bodyParser=require('body-parser')
const session=require('express-session')
const MongoStore = require('connect-mongo');
const mongoose=require('mongoose')
const port = process.env.PORT||3000
const routesIndex=require('./routes/index')
connectDB()
app.use(express.json())
app.use(cors())

app.use(session({
  secret: process.env.JWT_SECRET, // ✅ loaded from Render env
  resave: false,
  saveUninitialized: false,       // ✅ safer
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,   // 1 day
    secure: false                 // ✅ keep false for HTTP (true if using HTTPS/Vercel custom domain)
  }
}));



console.log("Mongo URI for session:", process.env.MONGO_URI);

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// app.get('/test-db', async (req, res) => {
//   try {
//     const collections = await mongoose.connection.db.listCollections().toArray();
//     const names = collections.map(c => c.name);
//     res.json({ message: '✅ Connected to DB!', collections: names });
//   } catch (err) {
//     console.error('❌ DB Test Failed:', err.message); // log error message
//     res.status(500).json({ error: err.message });     // return error
//   }
// });


app.use(bodyParser.urlencoded({extended:true}))
app.use('/',routesIndex)
app.use('/resume', express.static(path.join(__dirname, 'uploads/cv')))

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))