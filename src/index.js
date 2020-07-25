import express from 'express'

import main from './main.js'

const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Please use pass parameters like this /package/:package/version/:version')
})

app.get('/package/:package/version/:version', async (req, res) => {
    const { params } = req
    const packageName = params.package
    const { version } = params
    const dependencies = await main(packageName, version)
    res.send(`<pre>${ dependencies }</pre>`)
})

app.listen(port, () => console.log(`npm-dependencies app listening at http://localhost:${port}`))