// public/client.js
const socket = io();

let username;

function showNotification(message) {
  if (Notification.permission === 'granted') {
    const notification = new Notification('New Message', {
      body: message,
      silent: false,
      sticky: true,
    });

    notification.onclick = () => {
      // Handle what happens when the notification is clicked
      // For now, let's focus on the chat input
      document.getElementById('message-input').focus();
    };
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showNotification(message);
      }
    });
  }
}

const registerUser = () => {
  username = prompt('Enter your username:');
  socket.emit('register', username);
};

registerUser();

// Send chat message
document.getElementById('send').addEventListener('click', () => {
  const message = document.getElementById('message-input').value;
  socket.emit('group-chat-message', message);
  document.getElementById('message-input').value = '';
});

// Send private message
document.getElementById('send-private').addEventListener('click', () => {
  const recipientUserId = prompt('Enter recipient user ID:');
  if (recipientUserId) {
    const message = document.getElementById('message-input-private').value;
    socket.emit('private-message', recipientUserId, message);
    document.getElementById('message-input-private').value = '';
  }
});

socket.on('registration-success', (userId, registeredUsername) => {
  console.log(`Welcome, ${registeredUsername}! Your user ID is ${userId}`);
});

socket.on('chat-message', (senderUsername, message) => {
  showNotification(`${senderUsername}: ${message}`);

  // Create a new message element and append it to the chat div
  const messageElement = document.createElement('div');
  messageElement.textContent = `${
    senderUsername === username ? 'You' : senderUsername
  }: ${message}`;
  document.getElementById('chat').appendChild(messageElement);
});

socket.on('private-message', (senderUsername, message) => {
  showNotification(`Private from ${senderUsername}: ${message}`);

  // Create a new private message element and append it to the private chat div
  const messageElement = document.createElement('div');
  messageElement.textContent = `Private from ${senderUsername}: ${message}`;
  document.getElementById('private-chat').appendChild(messageElement);
});

socket.on('private-message-error', (errorMessage) => {
  alert(errorMessage);
});
