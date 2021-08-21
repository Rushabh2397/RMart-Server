require('dotenv').config()

module.exports = {
    
    port : process.env.PORT,
    connectionString : process.env.DB_URL,
    imgUrl : process.env.IMAGE_URL
}