const _ = require('lodash')
const express = require('express')
const router = express.Router({ mergeParams: true })
const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')
const keys = require('../config/keys')
const Detail = mongoose.model('details')
const multer = require('multer')
const cloudinary = require('cloudinary')

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname)
  }
})

const fileFilter = function (req, file, cb) {
  // image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false)
  }
  cb(null, true)
}

const upload = multer({ storage: storage, fileFilter: fileFilter })

cloudinary.config({
  cloud_name: keys.cloudinaryName,
  api_key: keys.cloudinaryApiKey,
  api_secret: keys.cloudinaryApiSecret
})

// GET Request for retrieving all product details
// INDEX
router.get(
  '/',
  async (req, res) => {
    const { id } = req.params
    if (!ObjectID.isValid(id)) {
      return res.status(404).send()
    }
    try {
      let details = await Detail
        .find()
        .populate('product')
        .exec()
      if (!details) {
        return res.status(404).send()
      }
      res.send({
        details
      })
    } catch (err) {
      return res.status(400).send({
        err
      })
    }
  }
)

// POST Request for creating a new product's details
// CREATE
router.post(
  '/',
  upload.single('image'),
  async (req, res) => {
    const { id } = req.params
    let { desc, category, colours } = req.body
    if (!ObjectID.isValid(id)) {
      return res.status(404).send()
    }

    try {
      let imgFile = await cloudinary.v2.uploader.upload(req.file.path)
      let detail = await Detail.create({
        product: id,
        description: desc,
        category,
        image: imgFile.secure_url,
        imageId: imgFile.public_id,
        colours: colours.split(',').map(colour => colour.trim())
      })
      if (!detail) {
        return res.status(404).send()
      }
      res.send({ detail })
    } catch (err) {
      return res.status(400).send({
        err
      })
    }
  }
)

// GET Request for retrieving a product's details
// INDEX
router.get(
  '/:detailId',
  async (req, res) => {
    const { id, detailId } = req.params
    if (!ObjectID.isValid(id) || !ObjectID.isValid(detailId)) {
      return res.status(404).send()
    }

    try {
      let detail = await Detail
        .findOne({ _id: detailId })
        .populate('product')
        .exec()
      if (!detail) {
        return res.status(404).send()
      }
      res.send({ detail })
    } catch (err) {
      return res.status(400).send({
        err
      })
    }
  }
)

// DELETE Request for updating a product's details
// DESTROY
router.delete(
  '/:detailId',
  async (req, res) => {
    const { id, detailId } = req.params
    if (!ObjectID.isValid(id) || !ObjectID.isValid(detailId)) {
      return res.status(404).send()
    }

    try {
      let detail = await Detail.findById(detailId)
      if (!detail) {
        return res.status(404).send()
      }
      await cloudinary.v2.uploader.destroy(detail.imageId)
      await detail.remove()
      res.send({ detail })
    } catch (err) {
      return res.status(400).send({
        err
      })
    }
  }
)

// PUT Request for updating a product's details
// UPDATE
router.put(
  '/:detailId',
  upload.single('image'),
  async (req, res) => {
    const { id, detailId } = req.params
    let body = _.pick(req.body, ['desc', 'category', 'colours'])
    if (!ObjectID.isValid(id) || !ObjectID.isValid(detailId)) {
      return res.status(404).send()
    }

    try {
      let detail = await Detail.findById(detailId).populate('product').exec()
      if (req.file) {
        await cloudinary.v2.uploader.destroy(detail.imageId)
        let imgFile = await cloudinary.v2.uploader.upload(req.file.path)
        detail.image = imgFile.secure_url
        detail.imageId = imgFile.public_id
      }
      if (!detail) {
        return res.status(404).send()
      }
      detail.description = body.desc
      detail.category = body.category
      detail.colours = body.colours.split(',').map(colour => colour.trim())
      await detail.save()
      res.send({ detail })
    } catch (err) {
      return res.status(400).send({
        err
      })
    }
  }
)
module.exports = router
