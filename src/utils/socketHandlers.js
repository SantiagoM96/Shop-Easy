const moment = require('moment');
const ChatManager = require('../DAOs/mongo/ChatManager.mongo.js');

const handleSocketConnection = (io) => {
  const messageManagerMongo = new ChatManager(io);

  io.on('connection', socket => {
    console.log('Nuevo cliente conectado', socket.id)

    socket.on('joinChat', async (newUser) => {
      try {
        socket.broadcast.emit('notification', `El usuario ${newUser} se unió al chat`);

        const messages = await messageManagerMongo.getMessages();

        const formattedMessages = messages.map((message) => ({
          ...message,
          formattedTimestamp: moment(message.timestamp).format('MMMM Do YYYY, h:mm:ss a'),
        }));

        socket.emit('printPreviousMessages', formattedMessages);
      } catch (error) {
        socket.emit('notification', { message: error.message, type: 'error' });
      }
    });

    socket.on('newMessage', async ({ user, message }) => {
      try {
        const newMessage = await messageManagerMongo.addMessage(user, message);
        socket.broadcast.emit('notification', `Hay un nuevo mensaje de ${user}`);

        io.emit('printNewMessage', {
          user: newMessage.user,
          content: newMessage.content,
          timestamp: moment(newMessage.timestamp).format('MMMM Do YYYY, h:mm:ss a'),
        });

      } catch (error) {
        socket.emit('notification', { message: error.message, type: 'error' });
      }
    });

  })
}

module.exports = handleSocketConnection