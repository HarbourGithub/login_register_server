const express = require('express')
const router = express.Router()
const {
    register,
    login,
    revisePassword,
    logout,
    refreshCaptcha
} = require('../routerHandler/user')
const { verifyRegister } = require('../common/middleware')


router.post('/register', verifyRegister, register)

router.post('/login', login)

router.post('/refreshCaptcha', refreshCaptcha)

router.post('/revisePassword', revisePassword)

router.post('api/logout', logout)

module.exports = router