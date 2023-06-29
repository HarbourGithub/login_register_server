const express = require('express')
const router = express.Router()
const {
    register,
    login,
    resetPassword
} = require('../routerHandler/user')
const { verifyRegister } = require('../common/middleware')


router.post('/register', verifyRegister, register)

router.post('/login', login)

router.post('/resetPassword', resetPassword)

module.exports = router