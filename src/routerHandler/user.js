const database = require('../common/database')
const bcrypt = require('bcryptjs')
const { v4: uuid } = require('uuid')
const jwt = require('jsonwebtoken')
const { secretKey, expiresIn } = require('../common/config')
const {
    redisSet,
    redisGet,
    redisDelete
} = require('../common/redis')

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
    const { userName, password } = req.body
    if (!userName || !password) {
        res.commonResSend(1, '账号密码不能为空')
    } else {
        const selectSql = 'select * from users where userName=?'
        database.query(selectSql, [userName], async (err, result) => {
            if (err) { return res.commonResSend(1, err.message) }
            if (result.length > 0) {
                const userInfo = result[0]
                const compareResult = bcrypt.compareSync(password, userInfo.password)
                if (compareResult) {
                    const payload = { ...userInfo, password: '', avater: '', }
                    const token = jwt.sign(payload, secretKey, { expiresIn })
                    //TODO apiFox会自动加上Bearer，接口测试使用该代码，与前端对接联调加上Bearer
                    res.commonResSend(0, '登录成功', { token })
                } else {
                    try {
                        const replay = await redisSet('123', {aaa: 4546}, 60000)
                        // const replay = await redisGet('123')
                        // console.log(replay)
                        res.commonResSend(1, '账号密码错误')
                    } catch (error) {
                        console.log(error)
                        res.commonResSend(1, '账号密码错误')
                    }
                    
                }
            } else {
                res.commonResSend(1, '该用户不存在')
            }
        })
    }
}

exports.resetPassword = (req, res) => {
    res.send('resetPassword ok')
}