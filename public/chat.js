const ul = document.getElementById('messageList');

const form = document.getElementById('sendMessages');
const message = document.getElementById('messageInput');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  socket.emit("sendMessage", (message.value))
});

socket.on("reseveMessage", (message) => {
    const li = document.createElement('li');
    li.textContent = message
    ul.appendChild(li);
    li.scrollIntoView({ behavior: 'smooth', block: 'end' });
}) 


            

            
