// Takes a input of a dictonary and outputs a tag for the create/join page
function createRoomTag(room) {
  const joinBox = document.getElementById('join-box');

  const tagDiv = document.createElement('div');
  tagDiv.classList.add('tag');

  const roomNameP = document.createElement('p');
  roomNameP.innerText = room.name;
  tagDiv.appendChild(roomNameP);

  const hostP = document.createElement('p');
  hostP.innerText = room.host;
  tagDiv.appendChild(hostP);

  const playersP = document.createElement('p');
  playersP.innerText = `${room.currentPlayers}/${room.maxPlayers}`;
  tagDiv.appendChild(playersP);

  const joinLink = document.createElement('a');
  joinLink.href = room.link || '#';
  joinLink.innerText = 'Join';
  tagDiv.appendChild(joinLink);

  joinBox.appendChild(tagDiv);
}


// Gets inputs from html
const form = document.getElementById('createRoom');
const usernameInput = document.getElementById('username');
const roomNameInput = document.getElementById('roomName');

// Listen for form submission
form.addEventListener('submit', function(e) {
  e.preventDefault(); // Prevent the page from refreshing
  //Cretes a new tag 
  
  let roomTag = {
    name:  roomNameInput.value,
    host:  usernameInput.value,
    currentPlayers: 1,
    maxPlayers: 2,
    link: `gamePage.html?username=${encodeURIComponent(usernameInput.value)}&room=${encodeURIComponent(roomNameInput.value)}`
  }
  console.log(`Genorated Link ${roomTag.link}`)
  createRoomTag(roomTag);
  socket.emit('roomCreated', roomTag)
});

