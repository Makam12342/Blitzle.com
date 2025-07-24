
// start server is npm run dev
const allRooms = []
const roomsData = []
let roomData = null
const path = require('path')
const http = require('http')
const express = require('express')
const socketIo = require('socket.io')


const app = express();
const server = http.createServer(app);
const io = socketIo(server)




// Sets static folder as the home page 4
app.use(express.static(path.join(__dirname, 'public')));
//run when a clinet connects to server
io.on('connection', socket => {

     
     // Sends all existing rooms to the new user
     socket.emit('existingRooms', allRooms);


     // exacutes when new room is created
     socket.on('roomCreated', (roomTag) => {
          console.log(`Room created: ${roomTag.name} by ${roomTag.host}`);
          roomsData.push(roomTag)
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

          
          if (playerCount === 2) {
               roomsData.forEach(roomD => {
                    if(roomD.name === room){
                         roomData = roomD
                    }
               });
               console.log(roomData)
               console.log(roomData.time)
               setTimeout(() =>{
               io.to(room).emit('startGame', roomData.time);
               }, 1000);
               io.emit('roomFull', room); // to remove from lobby UI

               // Remove the full room from the server list
               const index = allRooms.findIndex(r => r.name === room);
               if (index !== -1) {
                    allRooms.splice(index, 1);
               }
          }
          socket.on('turnFliperSend', ({ room, playersTurn, whiteTime, blackTime }) => {
               io.to(room).emit('turnFliperReseve', playersTurn, whiteTime, blackTime);
          });

          socket.on('gameOverSend', ({ room, winner, message}) => {
               io.to(room).emit('gameOverReceive', winner, message);
          });


          socket.on('positionDataSend', ({ room, piecesPosition }) => {
               
               io.to(room).emit('positionDataReseve', piecesPosition);
          });
          socket.on('algabraicSend', ({ room, algabraicNotation }) => {
               console.log(algabraicNotation)
               io.to(room).emit('algabraicReseve', algabraicNotation);
          });
          socket.on('moveHighlights', ({room, row, col}) => {
               io.to(room).emit('moveHighlightsReseve', {row, col});
          });
     
     });

     socket.on('mouseInput', (data) => {
          socket.to(data.room).emit('opponentMove', data);
     });

     // messages show up in console for now
     socket.emit('message', 'Welcome to Blitzle.com');
     socket.broadcast.emit( 'message', 'A user has joined the chat');


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

const PORT = process.env.PORT || 3000
// informs me to witch port the server is running on
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));