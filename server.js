
const express = require('express');
const http = require('http');
const WebSocket = require('ws');


const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const commands = process.argv.filter((item, index) => index > 1)

if (commands[0] == 'dev') {
    require('dotenv').config({
        path: './.env.prod'
    })

}
const UserModel = require('./models/User.model');
const { initConnection } = require('./utils/db');
let socketClients = new Map()

initConnection(process.env)
wss.on('connection', (socket) => {
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
app.get('/', (req, res) => {
    res.send({ data: "running" })
})
server.listen(process.env.PORT || 4020, () => {
    console.log(`Server started on port ${server.address().port}`);
});