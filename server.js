const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const path = require('path')

// Require in models
require('./models/Product')
require('./models/Detail')
const keys = require('./config/keys')
const { mongoose } = require('./db/mongoose')
const app = express()

const corsOptions = {
  origin: ['http://localhost:3000', 'https://lit-basin-96922.herokuapp.com'],
  methods: ['OPTIONS', 'GET', 'PUT', 'POST', 'DELETE'],
  credentials: true,
  exposedHeaders: 'Access-Control-Origin-Allow',
  allowedHeaders: 'content-type'
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors(corsOptions))
app.use(morgan('combined'))
app.use(helmet())

const productRoutes = require('./routes/productRoutes')
const detailRoutes = require('./routes/detailRoutes')
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/products/:id/details', detailRoutes)
app.get('/', (req, res) => res.send({
  'products_url': '/api/v1/products',
  'docs_url': '/api/v1/docs'
}))
app.get('/api/v1/docs', (req, res) => res.sendFile(path.join(__dirname, '/docs.html')))

app.listen(keys.port, () => console.log(`Listening on ${keys.port}`))

module.exports = { app }
