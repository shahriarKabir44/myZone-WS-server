const WebSocket = require('ws')
const socketServer = new WebSocket.Server({ port: 4030 });
const UserModel = require('../models/User.model')
function* socketIdGenerator() {
    let index = 0;

    while (true) {
        yield index++;
    }
}

const generator = socketIdGenerator();
socketServer.on('connection', (socket) => {
    socket.Id = generator.next().value
    socket.on('message', (data) => {
        let message = JSON.parse(data.toString())
        const { body } = message
        switch (message.type) {
            case 'setWebSocketId':
                const { userId } = body
                UserModel.setWebSocketId(userId, socket.Id)
                break;
            case 'personalMessage':
                const { participantId } = body
                UserModel.findById(participantId)
                    .then(({ websocketId }) => {
                        socketServer.clients.forEach(client => {
                            if (client.Id == websocketId) {

                                client.send(JSON.stringify(message))

                            }
                        })
                    })
                break;
            case 'notification':
                require('./WebSocketManagers/sendWSNotification')(socketServer, message)
        }

    })
})

