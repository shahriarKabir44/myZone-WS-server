const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    });

} else {
    startExpress();
}


function startExpress() {

    const app = require('express')()


    const httpServer = require('http').createServer(app)


    const io = require('socket.io')(httpServer)

    io.on('connection', (socketId) => { })
    app.use(express.json())


    app.listen(process.env.PORT || 4000)

}



