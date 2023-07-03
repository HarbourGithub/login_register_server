const database = require('../common/database')
const bcrypt = require('bcryptjs')
const { v4: uuid } = require('uuid')
const jwt = require('jsonwebtoken')
const { secretKey, expiresIn, loginDuration } = require('../common/config')
const {
    redisSet,
    redisSetTimeout,
    redisGet,
    redisDelete
} = require('../common/redis')
const { createCaptcha } = require('../common/utils')

exports.register = (req, res) => {
    const userInfo = req.body
    const selectSql = 'select * from users where userName=?'
    database.query(selectSql, [userInfo.userName], (err, result) => {
        if (err) { return res.commonResSend(1, err.message) }
        if (result.length > 0) {
            res.commonResSend(1, '用户名已存在')
        } else {
            userInfo.password = bcrypt.hashSync(userInfo.password, 10)
            userInfo.userId = uuid().replace(/-/g, '')
            const insertSql = 'insert into users set ?'
            database.query(insertSql, userInfo, (err, result) => {
                if (err) { return res.commonResSend(1, err.message) }
                res.commonResSend(0, '注册成功')
            })
        }
    })
}

exports.login = (req, res) => {
    const { userName, password, captcha } = req.body
    if (!userName || !password) {
        res.commonResSend(1, '账号密码不能为空')
    } else {
        const selectSql = 'select * from users where userName=?'
        database.query(selectSql, [userName], async (err, result) => {
            if (err) { return res.commonResSend(1, err.message) }
            if (result.length > 0) {
                const userInfo = result[0]
                let failNumber = 0
                const redisFailNumber = await redisGet(userName + 'failNumber')
                if (redisFailNumber) failNumber = redisFailNumber
                const redisCaptcha = await redisGet(userName + 'captcha')
                if (failNumber === 5) {
                    return res.commonResSend(1, '密码输入错误超过五次，请一小时后再试')
                } else if (failNumber >= 1 && failNumber < 5
                    && (!captcha || !redisCaptcha || captcha.toLowerCase() !== redisCaptcha.toLowerCase())) {
                    const { text, data } = createCaptcha()
                    await redisSet(userName + 'captcha', text)
                    await redisSetTimeout(userName + 'captcha', 60)
                    return res.commonResSend(0, '验证码错误', {
                        captcha: data,
                        failNumber
                    })
                }
                const compareResult = bcrypt.compareSync(password, userInfo.password)
                if (compareResult) {
                    const existToken = await redisGet(userInfo.userId)
                    let token = ''
                    if (existToken) {
                        token = existToken
                    } else {
                        const payload = { ...userInfo, password: '', avater: '' }
                        token = jwt.sign(payload, secretKey, { expiresIn: expiresIn + 's' })
                        await redisSet(userInfo.userId, token)
                        await redisSetTimeout(userInfo.userId, loginDuration)
                    }
                    await redisDelete(userName + 'failNumber')
                    await redisDelete(userName + 'captcha')
                    //TODO apiFox会自动加上Bearer，接口测试使用该代码，与前端对接联调加上Bearer
                    // res.commonResSend(0, '登录成功', { token: 'Bearer ' + token })
                    res.commonResSend(0, '登录成功', { token })
                } else {
                    const { text, data } = createCaptcha()
                    await redisSet(userName + 'failNumber', failNumber + 1)
                    await redisSetTimeout(userName + 'failNumber', 3600)
                    await redisSet(userName + 'captcha', text)
                    await redisSetTimeout(userName + 'captcha', 60)
                    res.commonResSend(0, '账号密码错误', {
                        captcha: data,
                        failNumber: failNumber + 1
                    })
                }
            } else {
                res.commonResSend(1, '该用户不存在')
            }
        })
    }
}

exports.refreshCaptcha = async (req, res) => {
    const { userName } = req.body
    const { text, data } = createCaptcha()
    await redisSet(userName + 'captcha', text)
    await redisSetTimeout(userName + 'captcha', 60)
    res.commonResSend(0, '验证码刷新成功', {
        captcha: data
    })
}

exports.revisePassword = (req, res) => {
    const { userName, password, newPassword, confirmPassword } = req.body
    if (!userName || !password) {
        res.commonResSend(1, '账号密码不能为空')
    } else if (!newPassword) {
        res.commonResSend(1, '新密码不能为空')
    } else if (!confirmPassword) {
        res.commonResSend(1, '确认新密码不能为空')
    } else if (newPassword !== confirmPassword) {
        res.commonResSend(1, '新密码和确认新密码不一致')
    } else {
        const selectSql = 'select * from users where userName=?'
        database.query(selectSql, [userName], async (err, result) => {
            if (err) { return res.commonResSend(1, err.message) }
            if (result.length > 0) {
                const userInfo = result[0]
                const compareResult = bcrypt.compareSync(password, userInfo.password)
                if (compareResult) {
                    newDatabasePassword = bcrypt.hashSync(newPassword, 10)
                    const sql = `update users set password=? where userId='${userInfo.userId}'`
                    database.query(sql, [newDatabasePassword], (err, result) => {
                        if (err) { return res.commonResSend(1, err.message) }
                        res.commonResSend(0, '修改密码成功')
                    })
                } else {
                    res.commonResSend(1, '账号密码错误')
                }
            } else {
                res.commonResSend(1, '该用户不存在')
            }
        })
    }
}

exports.logout = async (req, res) => {
    const userInfo = req.userInfo
    await redisDelete(userInfo.userId)
    res.commonResSend(0, '登出成功')
}