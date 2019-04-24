const express = require('express')
const path = require('path')
const app = express()
const port = 3000
var cors = require('cors');

app.get('/', (req, res) => res.sendFile('index.html', {
    root: path.join(__dirname)
}))
app.use(cors());

// for local testing
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// for heroku deployment
// app.listen(process.env.PORT || 3000)