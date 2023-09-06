const app = require('../middleware');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


// call connection
io.on('connection', (socket) => {
    console.log('a user connected');

    // call live specific with UUID
    socket.on('call',async (data)=> {
        // spread traffic
        io.emit('live'+data.UUID,data)
    })
    // call client with answer
    socket.on('answer',async (data)=> {
        // spread traffic client
        io.emit('client'+data.client,{data})
    })

    // candidate
    socket.on('candidate',async (data)=> {
        io.emit('setICE'+(data.UUID || data.client),data)
    })

    socket.on('disconnect', () => { 
        console.log('user disconnected');
    });
});

module.exports = { server , io , app }