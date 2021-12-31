const dotenv = require('dotenv')
const assert = require('assert')

dotenv.config()

const {
    PORT,
    HOST,
    MB11_USER,
    MB11_PASSWORD,
    MB11_SERVER,
    MB11_DATABASE,
    MB11_PORT,
    MB20_USER,
    MB20_PASSWORD,
    MB20_SERVER,
    MB20_DATABASE,
    MB20_PORT,
} = process.env

assert(PORT, 'Port is required')
assert(HOST, 'Host is required')
assert(MB11_USER, 'MB11_USER Parameter required')
assert(MB11_PASSWORD, 'MB11_PASSWORD Parameter required')
assert(MB11_SERVER, 'MB11_SERVER Parameter required')
assert(MB11_DATABASE, 'MB11_DATABASE Parameter required')
assert(MB11_PORT, 'MB11_PORT Parameter required')
assert(MB20_USER, 'MB20_USER Parameter required')
assert(MB20_PASSWORD, 'MB20_PASSWORD Parameter required')
assert(MB20_SERVER, 'MB20_SERVER Parameter required')
assert(MB20_DATABASE, 'MB20_DATABASE Parameter required')
assert(MB20_PORT, 'MB20_PORT Parameter required')

module.exports= {
    port: PORT,
    host: HOST,
    MB11_CONFIG:{
        user: MB11_USER,
        password: MB11_PASSWORD,
        server: MB11_SERVER,
        database: MB11_DATABASE,
        port: Number(MB11_PORT) ,
    },

    MB20_CONFIG:{
        user: MB20_USER,
        password: MB20_PASSWORD,
        server: MB20_SERVER,
        database: MB20_DATABASE,
        port: Number(MB20_PORT) ,
    },

}

