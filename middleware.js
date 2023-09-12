const express = require("express")
const app = express()
const path = require("path")
const cors = require("cors");

// create socket server


// setup
app.use(express.static(path.join(__dirname,"public")))
app.use(express.json({ limit:"50mb" }))
app.use(express.urlencoded({ extended:true }))
// allow *
app.use(cors())

// viewer extension
app.set('views engine','ejs')
app.set('views',path.join(__dirname,"views"))


module.exports = app
