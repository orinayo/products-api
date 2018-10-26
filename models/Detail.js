const mongoose = require('mongoose')
const { Schema } = mongoose

const DetailSchema = new Schema({
  product: {
    type: Schema.ObjectId,
    ref: 'products',
    required: true
  },
  description: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  category: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  image: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  imageId: String,
  colours: [{
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }]
})

mongoose.model('details', DetailSchema)
