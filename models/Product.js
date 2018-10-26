const mongoose = require('mongoose')
const { Schema } = mongoose

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  price: {
    type: String,
    required: true,
    minlength: 1
  }
})

mongoose.model('products', ProductSchema)
