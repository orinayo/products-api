const mongoose = require('mongoose')
const keys = require('../config/keys')
// Set up mongoose connection
mongoose.connect(
  keys.mongoURI,
  { useNewUrlParser: true },
  (error) => {
    if (error) {
      console.log(error)
    }
  }
)

// Get the default connection
const db = mongoose.connection
// Listen to db events
db.on('connected', () => console.log(`Successfully opened a connection to ${keys.mongoURI}`))
db.on('disconnected', () => console.log(`Successfully disconnected from ${keys.mongoURI}`))
db.on('error', () => console.log(`An error occured while connecting to the ${keys.mongoURI}`))

module.exports = {
  mongoose
}