module.exports = {
    secretKey: 'my_users_secret_key',
    expiresIn: 5184000, // token过期时间，单位秒（token过期时间设置为60天）
    loginDuration: 86400 // token失效时间，单位秒（根据业务逻辑设置token失效时间）
}