
// start server is npm run dev
const path = require('path')
const http = require('http')
const express = require('express')
const socketIo = require('socket.io')


const app = express();
const server = http.createServer(app);
const io = socketIo(server)


// Set static folder 
app.use(express.static(path.join(__dirname, 'public')));
//run when a clinet connects
io.on('connection', socket => {
     console.log('New conection...')

     socket.emit('message','Welcome to Blitzle.com')
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));