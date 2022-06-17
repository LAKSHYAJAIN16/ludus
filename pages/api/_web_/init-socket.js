import { Server } from 'socket.io'

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      console.log("REG CONNECTION");
      socket.on('create-message', msg => {
        console.log("works");
        socket.broadcast.emit('new-message', msg)
      })
    })
  }
  res.end()
}

export default SocketHandler