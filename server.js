
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
     socket.on('joinRoom', (room) => {
          socket.join(room);
          
          
                         
          // Get the room info from Socket.IO's adapter
          const roomInfo = io.sockets.adapter.rooms.get(room);
          const playerCount = roomInfo ? roomInfo.size : 0;
          socket.emit('roomJoined', room);
          let color = playerCount === 1 ? "white" : "black"
          socket.emit('colorAssigned', color)

          console.log(`Room "${room}" has ${playerCount} player(s).`);

          if (playerCount === 2) {
               io.to(room).emit('startGame');
               io.emit('roomFull', room); // to remove from lobby UI

               // Remove the full room from the server list
               const index = allRooms.findIndex(r => r.name === room);
               if (index !== -1) {
                    allRooms.splice(index, 1);
               }
          }
          socket.on('turnFliperSend', ({ room, playersTurn }) => {
               console.log(room)
               io.to(room).emit('turnFliperReseve', playersTurn);
          });
          socket.on('positionDataSend', ({ room, piecesPosition }) => {
               console.log(room)
               io.to(room).emit('positionDataReseve', piecesPosition);
          });
     });

     socket.on('mouseInput', (data) => {
          socket.to(data.room).emit('opponentMove', data);
     });

     // messages show up in console for now
     socket.emit('message', 'Welcome to Blitzle.com');
     socket.broadcast.emit('message', 'A user has joined the chat');


     socket.on('disconnecting', () => {
          // `socket.rooms` is a Set containing all rooms this socket is currently in,
          // including its own socket ID (which we ignore)
          for (const room of socket.rooms) {
          if (room === socket.id) continue; // skip personal room

          const roomInfo = io.sockets.adapter.rooms.get(room);
          const newCount = roomInfo ? roomInfo.size - 1 : 0;

          console.log(`Player left room "${room}". New count: ${newCount}`);

          // Inform all clients about updated room player count
          io.emit('roomUpdated', {
               roomId: room,
               currentPlayers: newCount,
          });
          }
     });

});

const PORT = 3000 || process.env.PORT
// informs me to witch port the server is running on
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));