const config = require('./config')
const MyBusiness11 = new (require('rest-mssql-nodejs'))(config.MB11_CONFIG)

module.exports = MyBusiness11