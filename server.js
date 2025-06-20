const express = require('express')
const connectDB = require('./config')
const cors=require('cors')
const app = express()
const path=require('path')
const bodyParser=require('body-parser')
const session=require('express-session')
require("dotenv").config()
const port = process.env.PORT||3000
const routesIndex=require('./routes/index')
connectDB()
app.use(express.json())
app.use(cors())
app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true if HTTPS
}));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.use(bodyParser.urlencoded({extended:true}))
app.use('/',routesIndex)
app.use('/resume', express.static(path.join(__dirname, 'uploads/cv')))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))