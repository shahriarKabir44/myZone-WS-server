const WebSocket = require('ws')
const socketServer = new WebSocket.Server({ port: process.env.PORT || 4020 });
const UserModel = require('./models/User.model');
const { initConnection } = require('./utils/db');
let socketClients = new Map()
require('dotenv').config({
    path: './.env.prod'
})

initConnection(process.env)
socketServer.on('connection', (socket) => {
    socket.on('message', (data) => {
        let message = JSON.parse(data.toString())
        const { body } = message
        if (message.type == 'setWebSocketId') {

            const { userId } = body
            UserModel.setWebSocketId(userId, 1)
            socket.Id = userId
            socketClients.set(socket.Id * 1, socket)
        }
        else if (message.type == 'personalMessage'
            || message.type == 'notification'
            || message.type == 'friendRequest'
        ) {
            if (socketClients.has(message.body.receiverId * 1))
                socketClients.get(message.body.receiverId * 1).send(JSON.stringify(message))
        }



    })
    socket.on('close', e => {
        socketClients.delete(socket.Id * 1)
        UserModel.setWebSocketId(socket.Id, 0)
    })

})

