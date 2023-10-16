'use strict'

const mongoose = require('mongoose')
const os = require('os')
const process = require('process')

const _SECONDS = 5000

//count connect
const countConnect = () => {
   const numConnection = mongoose.connections.length
   console.log(`Num of Connections: ${numConnection}`)
}

//check over load
const checkOverload = () => {
   setInterval(() => {
      const numConnection = mongoose.connections.length
      const numCores = os.cpus().length
      const memoryUsage = process.memoryUsage().rss
      //Example maximum number of connections based number of cores
      const maxConnections = numCores * 5

      console.log(`Active connections:: ${numConnection} `)
      console.log(`Memory usage:: ${memoryUsage / 1024 / 1024}Mb`)

      if (numConnection > maxConnections) {
         console.log(`Connection over load detected`)
      }
   }, _SECONDS) // Monitor every 5s
}

module.exports = { countConnect, checkOverload }
