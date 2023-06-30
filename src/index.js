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

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(resSendMiddleware)
app.use(expressjwt({ secret: secretKey, algorithms: ["HS256"] }).unless({path: ['/login', '/register', '/resetPassword']}))
app.use(analyzeToken)
app.use(userRouter)
app.use(handleError)

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})