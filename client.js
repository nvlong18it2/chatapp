const socket = io('http://localhost:3000')
const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const onlineContainer = document.getElementById('online-container')
const messageInput = document.getElementById('message-input') 
document.getElementById('files').addEventListener('change', handleFileSelect, false);
const name = prompt('What is your name?')
var count = 0
var timeout
start()
appendMessage('you joined')
socket.emit('new-user', name)
socket.on('chat-message', data =>{
   
    appendMessage(`${data.name}: ${data.message}`)

})

socket.on('Kicked', ()=>
  appendMessage('You were baned')    
)
socket.on('user-online', users =>{
    onlineContainer.innerHTML = ''
    Object.entries(users).forEach(val => {
        const [key, value] = val
        appendOnline(key, value);
      });
})
socket.on('send-image', data=>{
    appendImage(data)
})

messageForm.addEventListener('submit', e=>{
   stop()
    e.preventDefault()
    const error = /dmm|vl|cmm|cac/gi
    if(messageInput.value.match(error)){
        messageInput.value = messageInput.value.replace(error, '***')
        count++
        if(count==3){
            banUser()
        }
    }
    const message = messageInput.value
    appendMessage(`You: ${message}` )
    socket.emit('send-chat-message', message)
    messageInput.value = ''
    start()
})
function appendMessage(message){
    const messageElement = document.createElement('div')
    messageElement.innerText = message
    messageContainer.append(messageElement)
   
}
function appendImage(data){
    var x = document.createElement("IMG");
    x.setAttribute("src", data.binary || data);
    x.setAttribute("width", "404");
    x.setAttribute("height", "auto");
    x.setAttribute("alt", "Image error");
    messageContainer.append(x);
}
function appendOnline(key, value){
    const messageElement = document.createElement('li')
    const buttonElement = document.createElement('BUTTON')
    buttonElement.innerText = value + ' is online'
    messageElement.append(buttonElement)
    buttonElement.onclick =function() {
        messageContainer.append(`You baned ${value}`)
        socket.emit('kick-user', key)
    }
    onlineContainer.append(messageElement)
    
}

function handleFileSelect(ele){
    var file = ele.target.files[0];
    var fileReader = new FileReader();
    fileReader.readAsDataURL(file)
    fileReader.onload = () => {
        var arrayBuffer = fileReader.result; 
        appendImage(arrayBuffer)
        socket.emit('image-upload', { name: file.name, 
            type: file.type, 
            size: file.size, 
            binary: arrayBuffer })
     }
}
function banUser(){
    socket.emit('forceDisconnect');
    const r = confirm('You were banned \n Press Ok to rejoin')
    if(r==true){
        location.reload();
    }
}
function start(){
   timeout =  setTimeout(()=>{appendMessage('You were banned'), banUser()}, 15000)
} 
function stop() {
    clearTimeout(timeout);
  }