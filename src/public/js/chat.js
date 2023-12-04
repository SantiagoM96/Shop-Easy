const socket = io()

let user
let chatBox = document.getElementById('chatbox')
let messageLogs = document.getElementById('messageLogs')

const identificate = async () => {
    try {
        const result = await Swal.fire({
            title: 'Identify Yourself',
            input: 'text',
            text: 'Enter your username to start chatting',
            inputValidator: (value) => {
                return !value && 'You can\'t chat without identifying yourself!';
            },
            allowOutsideClick: false,
        });

        user = result.value;
        socket.emit('joinChat', user);
    } catch (error) {
        console.error('Error during identification:', error);
    }
};

identificate();

socket.on('notification', notif => {
    notificationContainer.innerHTML = notif
    setTimeout(() => {
        notificationContainer.innerHTML = ''
    }, 3000)
})

chatBox.addEventListener('keyup', e => {
    if (e.key === 'Enter' && chatBox.value.trim(0).length > 0 && user) {
        socket.emit('newMessage', { user: user, message: chatBox.value })
        chatBox.value = '';
    }
})

socket.on('printPreviousMessages', (messages) => {
    messageLogs.innerHTML = '';
    messages.forEach(message => {
        messageLogs.innerHTML += `
      <div><span class="message">${message.user} (${message.formattedTimestamp}):</span> ${message.content}</div>`
    });
});

socket.on('printNewMessage', ({ user, content, timestamp }) => {
    messageLogs.innerHTML += `
    <div><span class="message">${user} (${timestamp}):</span> ${content}</div>`
});



