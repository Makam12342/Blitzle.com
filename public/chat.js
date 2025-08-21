const ul = document.getElementById('messageList');
const form = document.getElementById('sendMessages');
const username = document.getElementById('usernameInput');
const message = document.getElementById('messageInput');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  socket.emit('sendMessage', {
    message: messageInput.value,
    username: usernameInput.value
  });
  messageInput.value = '';  // optional: clear input
}); 


function messageCreate(data) {
  const msgText = data.message;
  const userName = data.username;

  const li = document.createElement('li');
  const h3 = document.createElement('h3');
  h3.textContent = userName;
  li.appendChild(h3);

  const p = document.createElement('p');
  p.textContent = msgText;
  li.appendChild(p);

  ul.appendChild(li);
  li.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

socket.on('receiveMessage', (data) => {
  messageCreate(data)
  messageList.push(data)
});

socket.on('createMessages', (list) =>{
  list.forEach(element => {
     messageCreate(element)
  })
})


