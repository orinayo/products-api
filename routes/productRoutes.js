const _ = require('lodash')
const express = require('express')
const router = express.Router({ mergeParams: true })
const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')
const Product = mongoose.model('products')
const Detail = mongoose.model('details')

// GET Request for retrieving all products
// INDEX
router.get(
  '/',
  async (req, res) => {
    try {
      let products = await Product.find({})
      res.send({ products })
    } catch (err) {
      return res.status(400).send({
        err
      })
    }
  }
)

// POST Request for creating a new product
// CREATE
router.post(
  '/',
  async (req, res) => {
    let { name, price } = req.body
    try {
      let product = await Product.create({ name, price })
      res.send({ product })
    } catch (err) {
      return res.status(400).send({
        err
      })
    }
  }
)

// GET Request for retrieving one product
// INDEX
router.get(
  '/:id',
  async (req, res) => {
    const { id } = req.params
    if (!ObjectID.isValid(id)) {
      return res.status(404).send()
    }

    try {
      let product = await Product.findOne({ _id: id })
      if (!product) {
        return res.status(404).send()
      }
      res.send({ product })
    } catch (err) {
      return res.status(400).send({
        err
      })
    }
  }
)

// DELETE Request for updating a product
// DESTROY
router.delete(
  '/:id',
  async (req, res) => {
    const { id } = req.params
    if (!ObjectID.isValid(id)) {
      return res.status(404).send()
    }

    try {
      let detail = await Detail.findOneAndDelete({ product: id })
      if (!detail) {
        return res.status(404).send()
      }
    } catch (err) {
      return res.status(400).send({
        err
      })
    }

    try {
      let product = await Product.findOneAndDelete({ _id: id })
      if (!product) {
        return res.status(404).send()
      }
      res.send({ product })
    } catch (err) {
      return res.status(400).send({
        err
      })
    }
  }
)

// PUT Request for updating a product
// UPDATE
router.put(
  '/:id',
  async (req, res) => {
    const { id } = req.params
    let body = _.pick(req.body, ['name', 'price'])
    if (!ObjectID.isValid(id)) {
      return res.status(404).send()
    }
    try {
      let product = await Product.findOneAndUpdate({ _id: id },
        {
          $set: {
            'name': body.name,
            'price': body.price
          }
        },
        {
          new: true
        })

      if (!product) {
        return res.status(404).send()
      }
      res.send({ product })
    } catch (err) {
      return res.status(400).send({
        err
      })
    }
  }
)
module.exports = router
