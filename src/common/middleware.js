const Joi = require('joi')

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