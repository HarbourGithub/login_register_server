const redis = require('redis')

const redisClient = redis.createClient()

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
const redisSet = (key, value, timeout) => {
    return new Promise((resolve, reject) => {
        if (!key || typeof key !== 'string') {
            reject("key不能为空或必须为字符串")
            return
        } else if (!value) {
            reject("value不能为空或类型错误")
            return
        } else if (timeout && typeof timeout !== 'number') {
            reject("timeout必须为数字")
            return
        } else if (typeof timeout === 'number' && timeout <= 0) {
            reject("timeout必须大于0")
            return
        } else if (typeof value === "object") {
            value = JSON.stringify(value)
        }
        try {
            redisClient.set(key, value).then((replay) => {
                if (typeof timeout === 'number' && timeout > 0) {
                    redisClient.expire(key, timeout).then((expireReplay) => {
                        if (expireReplay) {
                            resolve(replay)
                        } else {
                            reject(`redis set ${key} timeout fail`)
                            return
                        }
                    }).catch((error) => {
                        reject(error)
                    })
                } else {
                    resolve(replay)
                }
            }).catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error)
        }
    })
}

const redisGet = (key) => {
    return new Promise((resolve, reject) => {
        if (!key || typeof key !== 'string') {
            reject("key必须为字符串")
            return
        }
        try {
            redisClient.get(key).then((value) => {
                redisClient.ttl(key).then((timeout) => {
                    const result = {}
                    result.timeout = timeout
                    // 利用 JSON.parse(string) 报错返回正确的数据格式
                    try {
                        result.value = JSON.parse(value)
                    } catch (error) {
                        result.value = value
                    }
                    resolve(result)
                }).catch((error) => {
                    reject(error)
                })
            }).catch((error) => {
                reject(error)
            })
        } catch (error) {
            reject(error)
        }
    })
}

const redisDelete = (key) => {
    return new Promise((resolve, reject) => {
        if (!key || typeof key !== 'string') {
            reject("key必须为字符串")
            return
        }
        try {
            redisClient.del(key).then((replay) => {
                resolve(replay)
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
    redisGet,
    redisDelete
}