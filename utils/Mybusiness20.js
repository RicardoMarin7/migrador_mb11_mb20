const config = require('./config')
const MyBusiness20 = new (require('rest-mssql-nodejs'))(config.MB20_CONFIG)

module.exports = MyBusiness20