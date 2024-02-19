const http = require('http');
const url = require("url")
const uuidv4 = require("uuid").v4
const {WebSocketServer} = require("ws");

const server = http.createServer();
const wsServer = new WebSocketServer({server});

const PORT = 5000;

const connections = {};
const users = {};

const broadCast = () => {
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid]
        const message = JSON.stringify(users)
        connection.send(message)
    })
}

const handleMessage = (bytes, uuid) => {
    const message = JSON.parse(bytes.toString())
    const user = users[uuid];
    user.state = message
    broadCast()
}


const handleClose = (uuid) => {
    delete connections[uuid]
    delete users[uuid]

    broadCast()
}

wsServer.on("connection", (socket, req) => {
    const { username } = url.parse(req.url, true).query
    const uuid = uuidv4()

    connections[uuid] = socket
    users[uuid] ={
        username : username,
        state : {},
    }

    socket.on("message", message => handleMessage(message, uuid))
    socket.on("close", () => handleClose(uuid))
})

server.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`)
})
