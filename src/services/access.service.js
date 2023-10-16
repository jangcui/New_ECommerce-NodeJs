'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, ConflictRequestError, AuthFailureError } = require('../core/error.response')

//service
const { findByEmail } = require('./shop.service')
////

const RoleShop = {
   SHOP: 'SHOP',
   WRITER: 'WRITER',
   EDITOR: 'EDITOR',
   ADMIN: 'ADMIN',
}
class AccessService {
   static signup = async ({ name, email, password }) => {
      //check email exists??
      const holderShop = await shopModel.findOne({ email }).lean()
      if (holderShop) {
         throw new BadRequestError('Error: Shop already registered!')
      }
      const passwordHash = await bcrypt.hash(password, 10)
      const newShop = await shopModel.create({
         name,
         email,
         password: passwordHash,
         roles: RoleShop.SHOP,
      })

      if (newShop) {
         const privateKey = crypto.randomBytes(64).toString('hex')
         const publicKey = crypto.randomBytes(64).toString('hex')

         const keyStore = await KeyTokenService.createKeyToken({
            userId: newShop._id,
            publicKey,
            privateKey,
         })

         if (!keyStore) {
            // throw new BadRequestError('Error: Shop already registered!')
            return {
               code: 'xxx',
               message: 'keyStore error',
            }
         }

         //create token
         const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)

         return {
            code: 201,
            metadata: {
               shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
               tokens,
            },
         }
      }
      return {
         code: 200,
         metadata: null,
      }
   }

   static login = async ({ email, password, refreshToken = null }) => {
      //check email exists??

      const foundShop = await findByEmail({ email: email })
      if (!foundShop) {
         throw new BadRequestError('Shop not registered!')
      }
      const match = bcrypt.compare(password, foundShop.password)
      if (!match) {
         throw new AuthFailureError('Authentication error')
      }
      const privateKey = crypto.randomBytes(64).toString('hex')
      const publicKey = crypto.randomBytes(64).toString('hex')

      const { _id: userId } = foundShop
      const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

      await KeyTokenService.createKeyToken({
         userId,
         refreshToken: tokens.refreshToken,
         privateKey,
         publicKey,
      })

      return {
         shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
         tokens,
      }
   }
}

module.exports = AccessService
