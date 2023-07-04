const svgCaptcha = require('svg-captcha')
// 创建验证码
exports.createCaptcha = () => {
    const svgCaptchaOption = {
        size: 4,
        noise: 3,
        color: true,
        background: '#666666'
    }
    return svgCaptcha.create(svgCaptchaOption)
}