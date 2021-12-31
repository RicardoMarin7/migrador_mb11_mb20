const express = require('express')
const app = express()
const config = require('./utils/config')
const salesController = require('./controllers/SalesController')

app.use(express.json())
app.use(express.static(`${__dirname}/public`))
app.use('/js', express.static(`${__dirname}/public/pages/js`))
app.listen( config.port, () => console.log(`App listening on http://${config.host}:${config.port}`))

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/pages/index.html`)
})

app.get('/migrate-sales', async (req, res) => {
    await salesController.migrateSales()
    res.send('Migrando Ventas')
})

