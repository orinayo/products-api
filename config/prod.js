// prod.js - production keys
module.exports = {
  mongoURI: process.env.MONGODB_URI,
  port: process.env.PORT,
  cloudinaryName: process.env.CLOUDINARY_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET
}
