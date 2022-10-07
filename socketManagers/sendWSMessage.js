module.exports = function (socketServer, message, socketClients) {
    console.log(socketClients.map(client => client.Id))
    console.log(message)
    socketClients.forEach(client => {
        if (client.Id == message.body.receiverId * 1) {
            client.send(JSON.stringify(message))

        }
    })
}   