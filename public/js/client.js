const socket = io('http://localhost:8000');
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");
const audio = new Audio('/ding.mp3'); // Ensure the correct path to the audio file
const userColors = {};

const lightPinkShades = ['#FFB6C1', '#FFC0CB', '#FFD1DC', '#FFE4E1', '#FFDFDD'];
let colorIndex = 0;

const getNextLightPinkShade = () => {
    const color = lightPinkShades[colorIndex % lightPinkShades.length];
    colorIndex++;
    return color;
}

const append = (message, position, color) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message', position);
    messageElement.style.backgroundColor = color;
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight; // Auto-scroll to the bottom
    if (position === 'left') {
        audio.play();
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right', '#f8d7da');
    socket.emit('send', { message, username });
    messageInput.value = '';
    return false; // Prevent page refresh
})

// ...existing code...
// const urlParams = new URLSearchParams(window.location.search);
// const username = urlParams.get('username');
// ...existing code...

if (!username) {
    window.location.href = '/public/login.html';
}

socket.emit('new-user-joined', username); // Emit event with username

socket.on('user-joined', name => {
    userColors[name] = getNextLightPinkShade();
    append(`${name} joined the chat`, 'left', userColors[name]);
})
socket.on('receive', data => {
    const { message: encryptedMessage, name: senderName } = data;
    socket.emit('decrypt', { encryptedMessage, senderName });
});
socket.on('display', data => {
    console.log("Message received for display:", data); // Debugging statement
    const { message: decryptedMessage, name: senderName } = data;
    if (!userColors[senderName]) {
        userColors[senderName] = getNextLightPinkShade();
    }
    append(`${senderName}: ${decryptedMessage}`, 'left', userColors[senderName]);
});

socket.on('left', name => {
    append(`${name} left the chat`, 'left', userColors[name]);
})