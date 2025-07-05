const socket = io();
// When code calls the message function on server this is what hapens to it for now it just consoles
socket.on('message', message => {
    console.log(message)
})
// Creates the tags while user is on page
socket.on('roomCreated', (roomTag) => {
  createRoomTag(roomTag);
});
// Creates tags when a user joins
socket.on('existingRooms', (allRooms) => {
  for(let i = 0; i < allRooms.length; i++){
    createRoomTag(allRooms[i]);
  }
});