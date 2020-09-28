const io = require('socket.io')(3000)
const users ={}
io.on('connection', socket =>{
        
        socket.on('new-user', name=>{
         users[socket.id] = name
         io.emit('user-online', users )
      })
      socket.on('image-upload', image=>{
      socket.broadcast.emit('send-image', image )
     })
    
       socket.on('send-chat-message', message => {
       socket.broadcast.emit('chat-message', {message: message, 
         name: users[socket.id]
              }) })
       socket.on('forceDisconnect', function(){
          socket.disconnect();
       });
       socket.on('kick-user', key=>{
         var name = users[key]
         io.to(`${key}`).emit('Kicked')
         io.sockets.sockets[key].disconnect();
         socket.broadcast.emit('chat-message', {message:  `baned ${name}`, 
         name: users[socket.id]
                 })
     });
      socket.on('disconnect', ()=>{
      delete users[socket.id]
      socket.broadcast.emit('user-online', users )
        })
})
