const dotenv = require('dotenv')
dotenv.config()

const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')

const app = express()
//init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//init db
require('./dbs/init.mongodb')

//init routers
app.use('', require('./routers'))

//handle error

app.use((req, res, next) => {
   const error = new Error('Not Found')
   error.status = 404
   return next(error)
})
app.use((err, req, res, next) => {
   const statusCode = err.status || 500

   return res.status(statusCode).json({
      status: 'Error',
      message: err.message || 'Internal Server Error',
      code: statusCode,
   })
})

module.exports = app
