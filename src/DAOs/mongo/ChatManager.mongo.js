const messageModel = require('./models/messageModel')

class MessageManager {
    constructor(io) {
        this.model = messageModel
        this.io = io
    }

    async getMessages() {
        try {
            const messages = await this.model.find();
            return messages.map((m) => m.toObject());
        } catch (error) {
            throw error;
        }
    }

    async addMessage(user, content) {
        try {
            const newMessage = await this.model.create({
                user: user,
                content: content
            });

            await newMessage.save();

            this.io.emit('newMessage', {
                user: newMessage.user,
                message: newMessage.content,
                timestamp: newMessage.timestamp
            });

            return newMessage.toObject();
        } catch (error) {
            throw error;
        }
    }
}

module.exports = MessageManager

