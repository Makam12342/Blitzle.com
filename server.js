
// start server is npm run dev
const allRooms = []
const path = require('path')
const http = require('http')
const express = require('express')
const socketIo = require('socket.io')


const app = express();
const server = http.createServer(app);
const io = socketIo(server)


// Sets static folder as the home page 
app.use(express.static(path.join(__dirname, 'public')));
//run when a clinet connects to server
io.on('connection', socket => {
     
     console.log('New connection...');

     // Sends all existing rooms to the new user
     socket.emit('existingRooms', allRooms);

     // exacutes when new room is created
     socket.on('roomCreated', (roomTag) => {
          console.log(`Room created: ${roomTag.name} by ${roomTag.host}`);

          allRooms.push(roomTag); // Saves room tag in the global room list

          // Sends the room to everyone except the creator otherwise creator gets two copies
          socket.broadcast.emit('roomCreated', roomTag);


     });

     // messages show up in console for now
     socket.emit('message', 'Welcome to Blitzle.com');
     socket.broadcast.emit('message', 'A user has joined the chat');


     socket.on('disconnect', () => {
     io.emit('message', 'A user has left the chat');
     });
});

const PORT = 3000 || process.env.PORT
// informs me to witch port the server is running on
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));