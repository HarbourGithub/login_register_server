const mysql = require('mysql')

const database = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'floor_plan'
})

module.exports = database