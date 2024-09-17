require('dotenv').config()
const express = require('express');
const app = express()
const path = require('path');
const { logger,logEvents } = require('./middlewares/logger');
const errorHandler = require('./middlewares/erroHandler');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOptions')
const cors = require('cors')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV)


// connectDB()
connectDB().catch(console.dir);


app.use(logger)

app.use(cors(corsOptions)) //api is available for those url
app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public'))) // here path set explisit 
// app.use( express.static('public')) // this also work , it is path on relative 

app.use('/', require('./routes/root'));

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (res.accepts('json')) {
        res.json({ message: '404 Not Found' });
    } else {
        res.type('text').send('404 Not Found');
    }
})

app.use(errorHandler)

mongoose.connection.once('open',()=>{
    console.log('connected to database')
    app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))
})

mongoose.connection.on('erro',err=>{
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})