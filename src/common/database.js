// 导入数据库
const mysql = require('mysql')
// 创建数据库实例并连接数据库
const database = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'users'
})
// 导出数据库
module.exports = database