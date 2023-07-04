const redis = require('redis')
// 创建redis客户端实例
const redisClient = redis.createClient()
// 连接redis
redisClient.connect()

// Redis 客户端监听连接事件
redisClient.on('connect', () => {
    console.log('Connected to Redis server')
})

// Redis 客户端监听错误事件
redisClient.on('error', (error) => {
    console.error('Redis error:', error)
})

// 封装常用redis方法
// 设置值
const redisSet = (key, value) => {
    return new Promise((resolve, reject) => {
        if (key === undefined || !key) {
            reject("key不能为空或undefined")
            return
        } else if (typeof key !== 'string') {
            reject("key必须为字符串")
            return
        } else if (value === undefined || !value || typeof value === 'boolean') {
            reject("value不能为空、undefined或布尔值")
            return
        } else if (typeof value === "object") {
            value = JSON.stringify(value)
        }
        try {
            redisClient.set(key, value).then((replay) => {
                if (replay === 'OK') {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }).catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error)
        }
    })
}
// 设置过期时间
const redisSetTimeout = (key, timeout) => {
    return new Promise((resolve, reject) => {
        if (key === undefined || !key) {
            reject("key不能为空或undefined")
            return
        } else if (typeof key !== 'string') {
            reject("key必须为字符串")
            return
        } else if (key === undefined || !key) {
            reject("timeout不能为空、undefined或0")
            return
        } else if (typeof timeout !== 'number' || timeout <= 0) {
            reject("timeout必须为大于零的数字")
            return
        }
        try {
            redisClient.expire(key, Math.ceil(timeout)).then((replay) => {
                resolve(replay)
            }).catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error)
        }
    })
}
// 获取值
const redisGet = (key) => {
    return new Promise((resolve, reject) => {
        if (key === undefined || !key) {
            reject("key不能为空或undefined")
            return
        } else if (typeof key !== 'string') {
            reject("key必须为字符串")
            return
        }
        try {
            redisClient.get(key).then((value) => {
                // 利用 JSON.parse(string) 报错返回正确的数据格式
                try {
                    resolve(JSON.parse(value))
                } catch (error) {
                    resolve(value)
                }
            }).catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error)
        }
    })
}

// 获取过期时间
const redisGetTimeout = (key) => {
    return new Promise((resolve, reject) => {
        if (key === undefined || !key) {
            reject("key不能为空或undefined")
            return
        } else if (typeof key !== 'string') {
            reject("key必须为字符串")
            return
        }
        try {
            redisClient.ttl(key).then((timeout) => {
                resolve(timeout)
            }).catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error)
        }
    })
}
// 删除值
const redisDelete = (key) => {
    return new Promise((resolve, reject) => {
        if (key === undefined || !key) {
            reject("key不能为空或undefined")
            return
        } else if (typeof key !== 'string') {
            reject("key必须为字符串")
            return
        }
        try {
            redisClient.del(key).then((replay) => {
                if (replay) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }).catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error)
        }
    })
}

// 设置指定数据库，传入索引值，0-15
const redisSetDb = (index) => {
    return new Promise((resolve, reject) => {
        if (index < 0 || index > 15) {
            reject("请输入正确数据库索引值0-15")
            return
        }
        try {
            redisClient.select(index).then((replay) => {
                resolve(true)
            }).catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error)
        }
    })
}

// 恢复默认数据库
const redisResetDb = () => {
    return new Promise((resolve, reject) => {
        try {
            redisClient.select(0).then((replay) => {
                resolve(true)
            }).catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    redisSet,
    redisSetTimeout,
    redisGet,
    redisGetTimeout,
    redisDelete,
    redisSetDb,
    redisResetDb
}