const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')
const Product = mongoose.model('products')
const Detail = mongoose.model('details')
const productOneId = new ObjectID()
const productTwoId = new ObjectID()
const cloudinary = require('cloudinary')

const products = [
  {
    _id: productOneId,
    name: 'Product1',
    price: 1200
  },
  {
    _id: productTwoId,
    name: 'Product2',
    price: 1000
  }
]

const details = [
  {
    _id: new ObjectID(),
    product: productOneId,
    description: 'A good product',
    category: 'Fashion',
    image: '',
    imageId: '',
    colours: ['#fff', '#000']
  }
]

const populateProducts = function (done) {
  this.timeout(10000)
  Product.deleteMany({})
    .then(() => Detail.deleteMany({}))
    .then(() => {
      Product.insertMany(products)
    })
    .then(() => {
      Detail.create(details[0])
    })
    .then(() => done())
}

const uploadImage = function (done) {
  this.timeout(30000)
  cloudinary.v2.uploader.upload(`${__dirname}/test.png`)
    .then(imgFile => {
      details[0].image = imgFile.secure_url
      details[0].imageId = imgFile.public_id
    })
    .then(() => done())
}

module.exports = {
  details,
  products,
  populateProducts,
  uploadImage
}
