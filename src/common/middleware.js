const Joi = require('joi')
const { secretKey } = require('../common/config')
const jwt = require('jsonwebtoken')
const { redisGet } = require('../common/redis')

exports.resSendMiddleware = (req, res, next) => {
    res.commonResSend = (status, message, data) => {
        res.send({
            status,
            message,
            data: data ? data : null
        })
    }
    next()
}

exports.analyzeToken = async (req, res, next) => {
    const headerToken = req.headers['authorization']
    if (headerToken) {
        const token = headerToken.replace('Bearer ', '')
        const userInfo = jwt.verify(token, secretKey)
        // 判断是否是有效未超时的token
        const isEfficientToken = await redisGet(userInfo.userId)
        // token有效，将用户信息存入req
        if (isEfficientToken) {
            req.userInfo = userInfo
        } else {
            return res.commonResSend(401, '身份认证失败')
        }
    }
    next()
}

exports.handleError = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        // JWT 认证失败
        res.commonResSend(401, '身份认证失败')
    }
}

exports.verifyRegister = (req, res, next) => {
    const userInfo = req.body
    const schema = Joi.object({
        userName: Joi.string().alphanum().min(3).max(32).required(),
        password: Joi.string().alphanum().min(6).max(32).required(),
        nickName: Joi.string().min(1).max(64),
        email: Joi.string().email(),
        phoneNumber: Joi.string().min(6).max(11).pattern(/^\d+$/),
        avater: Joi.string().dataUri()
    })
    const result = schema.validate(userInfo)
    if (result.error) {
        return res.commonResSend(1, result.error.details)
    } else {
        next()
    }
}