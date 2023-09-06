const { app , server } = require("./io/main")

// rotes
const index = require('./routes/index')
const live  = require('./routes/live')
const createlive = require('./routes/createlive')
const redirect = require('./routes/redirect')

// mounter a router
app.get('/',index.get)
app.get('/live',live.get)
app.get('/createLive',createlive.get)
app.post('/redirect',redirect.post)


// run server
server.listen(3000,()=> {
    console.log("Server start on port 3000")
})