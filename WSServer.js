const WebSocket = require('ws')
const socketServer = new WebSocket.Server({ port: 4030 });
const UserModel = require('./models/User.model')
let socketClients = new Map()
socketServer.on('connection', (socket) => {
    console.log("here")
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
        console.log('disconnected', socket.Id)
        socketClients.delete(socket.Id * 1)
        UserModel.setWebSocketId(socket.Id, 0)
    })

})

socketServer.on('close', (e) => {
    console.log(e)
})