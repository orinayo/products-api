const expect = require('expect')
const request = require('supertest')
const fs = require('mz/fs')
const { ObjectID } = require('mongodb')
const { app } = require('../server')
const mongoose = require('mongoose')
const Product = mongoose.model('products')
const Detail = mongoose.model('details')
const { details, products, populateProducts, uploadImage } = require('./seed/seed')

beforeEach(uploadImage)
beforeEach(populateProducts)

describe('POST /api/v1/products', () => {
  it('should create a new product', done => {
    let name = 'product 3'
    let price = 2000

    request(app)
      .post('/api/v1/products')
      .send({ name, price })
      .expect(200)
      .expect(res => {
        expect(res.body.product.name).toBe(name)
        expect(res.body.product.price).toBe(price.toString())
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        Product.find({ name }).then(product => {
          expect(product.length).toBe(1)
          expect(product[0].name).toBe(name)
          expect(product[0].price).toBe(price.toString())
          done()
        }).catch(err => done(err))
      })
  })

  it('should not create a product with invalid data', done => {
    request(app)
      .post('/api/v1/products')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        Product.find().then(product => {
          expect(product.length).toBe(2)
          done()
        }).catch(err => done(err))
      })
  })
})

describe('GET /api/v1/products', () => {
  it('should get all products', done => {
    request(app)
      .get('/api/v1/products')
      .expect(200)
      .expect(res => {
        expect(res.body.products.length).toBe(2)
      })
      .end(done)
  })
})

describe('GET /api/v1/products/:id', () => {
  it('should return a product', done => {
    let id = products[0]._id.toHexString()
    request(app)
      .get(`/api/v1/products/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.product.name).toBe(products[0].name)
        expect(res.body.product.price).toBe(products[0].price.toString())
      })
      .end(done)
  })

  it('should return 404 if product not found', done => {
    let id = new ObjectID().toHexString()
    request(app)
      .get(`/api/v1/products/${id}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', done => {
    request(app)
      .get(`/api/v1/products/123`)
      .expect(404)
      .end(done)
  })
})

describe('DELETE /api/v1/products/:id', () => {
  it('should remove a product', done => {
    let id = products[0]._id.toHexString()
    request(app)
      .delete(`/api/v1/products/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.product._id).toBe(id)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        Product.findById(id).then(product => {
          expect(product).toBeFalsy()
        }).then(() => {
          Detail.find({ product: id }).then(detail => {
            expect(detail).toEqual([])
            done()
          })
        }).catch(err => done(err))
      })
  })

  it('should return 404 if product not found', done => {
    let id = new ObjectID().toHexString()
    request(app)
      .delete(`/api/v1/products/${id}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', done => {
    request(app)
      .delete(`/api/v1/products/123`)
      .expect(404)
      .end(done)
  })
})

describe('PUT /api/v1/products/:id', () => {
  it('should update the product', done => {
    let id = products[0]._id.toHexString()
    let name = 'product name changed'
    let price = 500
    request(app)
      .put(`/api/v1/products/${id}`)
      .send({
        name,
        price
      })
      .expect(200)
      .expect(res => {
        expect(res.body.product.name).toBe(name)
        expect(res.body.product.price).toBe(price.toString())
      })
      .end(done)
  })

  it('should return 404 if product not found', done => {
    let id = new ObjectID().toHexString()
    request(app)
      .put(`/api/v1/products/${id}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', done => {
    request(app)
      .put(`/api/v1/products/123`)
      .expect(404)
      .end(done)
  })
})

describe('POST /api/v1/products/:id/details', () => {
  it(`should create a product's details`, done => {
    let imgFile = `${__dirname}/testFile/test.png`
    let detail = {
      desc: 'A better product',
      category: 'Gadgets',
      image: imgFile,
      colours: '#000,#fff'
    }
    let id = products[1]._id.toHexString()
    fs.exists(imgFile)
      .then((exists) => {
        if (!exists) throw new Error('file does not exist')
        return request(app)
          .post(`/api/v1/products/${id}/details`)
          .field('desc', detail.desc)
          .field('category', detail.category)
          .field('colours', detail.colours)
          .attach('image', imgFile)
          .expect(200)
          .expect(res => {
            expect(res.body.detail.description).toBe(detail.desc)
            expect(res.body.detail.category).toBe(detail.category)
            expect(typeof res.body.detail.image).toBe('string')
            expect(typeof res.body.detail.imageId).toBe('string')
            expect(res.body.detail.colours).toEqual(expect.arrayContaining(detail.colours.split(',')))
            expect(res.body.detail.product).toBe(id)
          })
      })
      .then(() => Detail.find({ product: id }))
      .then(foundDetail => {
        expect(foundDetail.length).toBe(1)
        expect(foundDetail[0].description).toBe(detail.desc)
        expect(foundDetail[0].category).toBe(detail.category)
        expect(typeof foundDetail[0].image).toBe('string')
        expect(typeof foundDetail[0].imageId).toBe('string')
        expect(foundDetail[0].colours).toEqual(expect.arrayContaining(detail.colours.split(',')))
        done()
      }).catch(err => done(err))
  }, 30000)

  it('should not create product details with invalid data', done => {
    let id = products[1]._id.toHexString()
    request(app)
      .post(`/api/v1/products/${id}/details`)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        Detail.find().then(detail => {
          expect(detail.length).toBe(1)
          done()
        }).catch(err => done(err))
      })
  })
})

describe('GET /api/v1/products/:id/details', () => {
  it('should get all product details', done => {
    let id = products[0]._id.toHexString()
    request(app)
      .get(`/api/v1/products/${id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.body.details.length).toBe(1)
      })
      .end(done)
  })
})

describe('GET /api/v1/products/:id/details/:detailId', () => {
  it(`should return a product's details`, done => {
    let id = products[0]._id.toHexString()
    let detailId = details[0]._id.toHexString()
    request(app)
      .get(`/api/v1/products/${id}/details/${detailId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.detail.description).toBe(details[0].description)
        expect(res.body.detail.category).toBe(details[0].category)
        expect(res.body.detail.image).toBe(details[0].image)
        expect(res.body.detail.imageId).toBe(details[0].imageId)
        expect(res.body.detail.colours).toEqual(expect.arrayContaining(details[0].colours))
        expect(res.body.detail.product._id).toBe(id)
      })
      .end(done)
  })

  it(`should return 404 if product's details not found`, done => {
    let id = new ObjectID().toHexString()
    let detailId = new ObjectID().toHexString()
    request(app)
      .get(`/api/v1/products/${id}/details/${detailId}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', done => {
    request(app)
      .get(`/api/v1/products/123/details/456`)
      .expect(404)
      .end(done)
  })
})

describe('DELETE /api/v1/products/:id/details/:detailId', () => {
  it(`should remove a product's details`, done => {
    let id = products[0]._id.toHexString()
    let detailId = details[0]._id.toHexString()
    request(app)
      .delete(`/api/v1/products/${id}/details/${detailId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.detail._id).toBe(detailId)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        Detail.findById(detailId).then(detail => {
          expect(detail).toBeFalsy()
          done()
        }).catch(err => done(err))
      })
  })

  it(`should return 404 if product's details not found`, done => {
    let id = new ObjectID().toHexString()
    let detailId = new ObjectID().toHexString()
    request(app)
      .delete(`/api/v1/products/${id}/details/${detailId}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', done => {
    request(app)
      .delete(`/api/v1/products/123/details/456`)
      .expect(404)
      .end(done)
  })
})

describe('PUT /api/v1/products/:id/details/:detailId', () => {
  it(`should update the product's details`, done => {
    let id = products[0]._id.toHexString()
    let detailId = details[0]._id.toHexString()
    let desc = 'Test product API'
    let category = 'Gadgets'
    let image = `${__dirname}/testFile/test.png`
    let colours = '#fff,#000'

    fs.exists(image)
      .then((exists) => {
        if (!exists) throw new Error('file does not exist')
        return request(app)
          .put(`/api/v1/products/${id}/details/${detailId}`)
          .field('desc', desc)
          .field('category', category)
          .field('colours', colours)
          .attach('image', image)
          .expect(200)
          .expect(res => {
            expect(res.body.detail.description).toBe(desc)
            expect(res.body.detail.category).toBe(category)
            expect(typeof res.body.detail.image).toBe('string')
            expect(typeof res.body.detail.imageId).toBe('string')
            expect(res.body.detail.colours).toEqual(colours.split(',').map(colour => colour.trim()))
            expect(res.body.detail.product._id).toBe(id)
            expect(res.body.detail.product.name).toBe(products[0].name)
            expect(res.body.detail.product.price).toBe(products[0].price.toString())
            done()
          })
      }).catch(err => done(err))
  }, 30000)

  it(`should return 404 if product's details not found`, done => {
    let id = new ObjectID().toHexString()
    let detailId = new ObjectID().toHexString()
    request(app)
      .put(`/api/v1/products/${id}/details/${detailId}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', done => {
    request(app)
      .put(`/api/v1/products/123/details/456`)
      .expect(404)
      .end(done)
  })
})
