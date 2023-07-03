const svgCaptcha = require('svg-captcha')

exports.createCaptcha = () => {
    const svgCaptchaOption = {
        size: 4,
        noise: 3,
        color: true,
        background: '#666666'
    }
    return svgCaptcha.create(svgCaptchaOption)
}