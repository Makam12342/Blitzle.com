let allRoomsId = null
let timerOption = null
let timerName = null
let lastroomCeatedTime = Date.now()
const joinBox = document.getElementById('join-box');


function createPaswordPopUp(room){
 const joinConformation = document.createElement('div');
  joinConformation.classList.add('tag');
  joinConformation.setAttribute('data-room', room.name);
  joinConformation.id = "join-com"

  const roomNameP = document.createElement('p');
  roomNameP.innerText = `Room: ${room.name}`;
  joinConformation.appendChild(roomNameP);

  const hostP = document.createElement('p');
  hostP.innerText = `User: ${room.host}`;
  joinConformation.appendChild(hostP);

  const timerP = document.createElement('p');
  timerP.innerText = `Timer: ${room.timeN}`;
  joinConformation.appendChild(timerP);

  const playersP = document.createElement('p');
  playersP.innerText = `Players: ${room.currentPlayers}/${room.maxPlayers}`;
  playersP.classList.add('players-count');
  joinConformation.appendChild(playersP);

  const input = document.createElement('input');
  input.placeholder = 'Password';
  joinConformation.appendChild(input);


  const joinLink = document.createElement('a');
  joinLink.href = room.link || '#';
  joinLink.innerText = 'Join';
  joinConformation.appendChild(joinLink);

  joinBox.appendChild(joinConformation);

}





// Create a room tag in the lobby UI
function createRoomTag(room) {
  if(timerOption){
    console.log(`Timer mode ${timerOption}`)
  } else{
    console.log("You did not select a timed mode so timer is set to 5 min")
    timerOption = 300
    timerName = "5 min"
  }
  
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

  const timerP = document.createElement('p');
  timerP.innerText = room.timeN;
  tagDiv.appendChild(timerP);

  const playersP = document.createElement('p');
  playersP.innerText = `${room.currentPlayers}/${room.maxPlayers}`;
  playersP.classList.add('players-count');
  tagDiv.appendChild(playersP);

  const joinButton = document.createElement('button');
  joinButton.href = room.link || '#';
  joinButton.innerText = 'Join';
  joinButton.onclick = function () {
    createPaswordPopUp(room)
  } 
  tagDiv.appendChild(joinButton);

  joinBox.appendChild(tagDiv);
  
}

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
  lastroomCeatedTime = Date.now()
});

socket.on('existingRooms', (allRooms) => {
  console.log(allRooms)
  allRoomsId = allRooms
  allRooms.forEach(room => {
    createRoomTag(room);
  });
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
    time: timerOption,
    timeN: timerName,
    currentPlayers: 0,
    maxPlayers: 2,
    link: `gamePage.html?username=${encodeURIComponent(usernameInput.value)}&room=${encodeURIComponent(roomNameInput.value)}`
  };
  console.log(roomTag.time)

  socket.emit('roomCreated', roomTag);
  document.getElementById('createRoom').reset();
  createRoomTag(roomTag);  
});




const buttons = document.querySelectorAll('button.btn');

buttons.forEach(button => {
  button.addEventListener('click', () => {

    buttons.forEach(btn => btn.classList.remove('activated'));
    button.classList.add('activated')
    timerOption = button.dataset.value
    timerName = button.textContent
    
  })
});