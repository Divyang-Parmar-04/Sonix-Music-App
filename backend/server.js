const express = require('express')
const cors = require('cors')
const dotenv = require("dotenv").config()

const Routers = require('./routers/router.js')

const PORT = 3000 || process.env.PORT
const app = express()

// middleware : 
app.use(cors())
app.use(express.json())

// Routes : 
app.use("/api/music", Routers)


app.listen(PORT,()=>console.log(`Server Started at PORT : ${PORT}`))