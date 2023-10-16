'use strict'

const { CREATED, SuccessResponse } = require('../core/success.response')
const AccessService = require('../services/access.service')
class AccessController {
   signup = async (req, res, next) => {
      new CREATED({
         message: 'Resisted OK!',
         metadata: await AccessService.signup(req.body),
         options: {
            limit: 10,
         },
      }).send(res)
   }
   login = async (req, res, next) => {
      new SuccessResponse({
         metadata: await AccessService.login(req.body),
      }).send(res)
   }
}

module.exports = new AccessController()
