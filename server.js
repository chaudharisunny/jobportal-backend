require("dotenv").config()
const express = require('express')
const connectDB = require('./config')
const cors=require('cors')
const app = express()
const path=require('path')
const bodyParser=require('body-parser')
const session=require('express-session')
const MongoStore = require('connect-mongo');

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

app.use(bodyParser.urlencoded({extended:true}))
app.use('/',routesIndex)
app.use('/resume', express.static(path.join(__dirname, 'uploads/cv')))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))