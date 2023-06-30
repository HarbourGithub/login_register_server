const express = require('express')
const router = express.Router()
const {
    register,
    login,
    resetPassword,
    logout,
    test
} = require('../routerHandler/user')
const { verifyRegister } = require('../common/middleware')


router.post('/register', verifyRegister, register)

router.post('/login', login)

router.post('/resetPassword', resetPassword)

router.post('/logout', logout)

router.post('/test', test)

module.exports = router