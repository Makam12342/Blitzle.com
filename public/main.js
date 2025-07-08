let playersColor = null
// When code calls the message function on server this is what hapens to it for now it just consoles
socket.on('message', message => {
    console.log(message)
})


socket.on('colorAssigned', (color) => {
  playersColor = color
  console.log(`your color is ${color}`)
})
