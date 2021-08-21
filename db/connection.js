const mongoose = require('mongoose')
const config = require('../config')

let connection = mongoose.connect(config.connectionString, { useNewUrlParser: true ,useUnifiedTopology: true,useFindAndModify: false})

mongoose.connection.on('connected',()=>{
    console.log("DB connected successfully.")
})

mongoose.connection.on('error',err=>{
    console.log("DB ERROR:",err)
})

module.exports = connection