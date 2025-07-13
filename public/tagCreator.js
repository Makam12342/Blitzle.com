
const joinBox = document.getElementById('join-box');

// Create a room tag in the lobby UI
function createRoomTag(room) {
  if (findRoomTag(room.name)) return; // Already exists
  const tagDiv = document.createElement('div');
  tagDiv.classList.add('tag');
  tagDiv.setAttribute('data-room', room.name);

  const roomNameP = document.createElement('p');
  roomNameP.innerText = room.name;
  tagDiv.appendChild(roomNameP);

  const hostP = document.createElement('p');
  hostP.innerText = room.host;
  tagDiv.appendChild(hostP);

  const playersP = document.createElement('p');
  playersP.innerText = `${room.currentPlayers}/${room.maxPlayers}`;
  playersP.classList.add('players-count');
  tagDiv.appendChild(playersP);

  const joinLink = document.createElement('a');
  joinLink.href = room.link || '#';
  joinLink.innerText = 'Join';
  tagDiv.appendChild(joinLink);

  joinBox.appendChild(tagDiv);
  
}

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
// Find a room tag element by room name
function findRoomTag(roomName) {
  return joinBox.querySelector(`.tag[data-room="${roomName}"]`);
}

// Update the player count displayed in the tag
function updateRoomPlayerCount(roomName, currentPlayers, maxPlayers = 2) {
  const tag = findRoomTag(roomName);
  if (tag) {
    const playersP = tag.querySelector('.players-count');
    playersP.innerText = `${currentPlayers}/${maxPlayers}`;
  }
}
// removes the tag from the list so that when user refreshes it dosent show up again
function removeRoomFromList(roomName) {
  const index = allRooms.findIndex(room => room.name === roomName);
  if (index !== -1) {
    allRooms.splice(index, 1);
  }
}


// Remove a room tag from the lobby UI
function removeRoomTag(roomName) {
  const tag = findRoomTag(roomName);
  if (tag) {
    tag.remove();
    
  }
}



// Socket event listeners
socket.on('roomCreated', (room) => {
  createRoomTag(room);
});

socket.on('existingRooms', (allRooms) => {
  for (const room of allRooms) {
    createRoomTag(room);
  }
});

socket.on('roomUpdated', (data) => {
  updateRoomPlayerCount(data.roomId, data.currentPlayers);
});

socket.on('roomFull', (roomId) => {
  removeRoomTag(roomId);
});

// Form submission handler to create new rooms
const form = document.getElementById('createRoom');
const usernameInput = document.getElementById('username');
const roomNameInput = document.getElementById('roomName');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  console.log("Form submitted");

  const roomTag = {
    name: roomNameInput.value,
    host: usernameInput.value,
    currentPlayers: 0,
    maxPlayers: 2,
    link: `gamePage.html?username=${encodeURIComponent(usernameInput.value)}&room=${encodeURIComponent(roomNameInput.value)}`
  };

  socket.emit('roomCreated', roomTag);
  document.getElementById('createRoom').reset();
  createRoomTag(roomTag);  // Optionally add immediately to UI
});
