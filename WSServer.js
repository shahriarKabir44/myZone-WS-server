const WebSocket = require('ws')
const socketServer = new WebSocket.Server({ port: 4030 });
const UserModel = require('./models/User.model')
let socketClients = []
socketServer.on('connection', (socket) => {
    console.log("here")
    socket.on('message', (data) => {
        let message = JSON.parse(data.toString())
        const { body } = message
        if (message.type == 'setWebSocketId') {

            const { userId } = body
            UserModel.setWebSocketId(userId, 1)
            socket.Id = userId
            socketClients.push(socket)
        }
        else if (message.type == 'personalMessage'
            || message.type == 'notification'
            || message.type == 'friendRequest'
        ) {
            require('./socketManagers/sendWSMessage')(socketServer, message, socketClients)
        }



    })
    socket.on('close', e => {
        console.log('disconnected', socket.Id)
        socketClients = socketClients.filter(client => client.Id != socket.Id)
        UserModel.setWebSocketId(socket.Id, 0)
    })

})

socketServer.on('close', (e) => {
    console.log(e)
})