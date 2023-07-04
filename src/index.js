const express = require('express')
const cors = require('cors')
const userRouter = require('./router/user')
const app = express()
const { expressjwt } = require('express-jwt')
const {
    resSendMiddleware,
    handleError,
    analyzeToken
} = require('./common/middleware')
const { secretKey } = require('./common/config')

// 处理跨域中间件
app.use(cors())
// 处理解析表单数据中间件
app.use(express.urlencoded({ extended: false }))
// 封装res.send()方法中间件
app.use(resSendMiddleware)
// 验证token中间件
app.use(expressjwt({
    secret: secretKey,
    algorithms: ["HS256"]
}).unless({
    path: ['/login', '/register', '/revisePassword', '/refreshCaptcha']
}))
// 解析token中间件
app.use(analyzeToken)
// 注册路由
app.use(userRouter)
// 注册全局错误中间件
app.use(handleError)
// 启动服务
app.listen(3000, () => {
    console.log('Server is running on port 3000')
})