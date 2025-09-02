const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require('fs').promises;

app.use(express.static("public")); // Servir arquivos da pasta public

let users = [];
let chatRooms = [];
let currentRoom = "";
let data;
let messages = {};

async function getData() {
    try {
        const response = await fs.readFile('public/data/data.json', 'utf-8');
        data = JSON.parse(response);
    } catch (error) {
        console.error("Erro ao ler JSON:", error);
    }
}

async function setData(params) {
    try {
        await fs.writeFile('public/data/data.json', JSON.stringify(params, null, 2));
    } catch (error) {
        console.error("Erro ao atualizar JSON:", error);
    }
}

io.on("connection", (socket) => {
    console.log("Novo usuário conectado");

    socket.on("get data", () => {
        if (!data) getData();

        socket.emit("get data", data);
    });

    socket.on("join room", (_room) => {
        socket.join(_room);

        currentRoom = _room;

        if (messages[_room]) socket.emit("get data", messages[_room]);
    });

    socket.on("leave room", (_room) => {
        socket.leave(_room);

        currentRoom = "";
    });

    socket.on("get chatrooms", () => {
        socket.emit("chatrooms data", chatRooms);
    });

    socket.on("create chat", (username, data) => {
        chatRooms.push(data);

        io.emit("chatrooms data", chatRooms);
    });

    socket.on("new username", (name) => {
        users.push(name);

        socket.username = name;
        io.emit("get users", users);
    });

    socket.on("get users", () => {
        socket.emit("get users", users);
    });

    socket.on("get messages", (room) => {
        socket.emit("get data", messages[room]);
    });

    socket.on("chat message", (_username, msg) => {
        if (currentRoom != "") {
            let newMessage = { username: _username, msg, localeTime: new Date().toLocaleTimeString(), time: new Date().getTime() };
            
            io.to(currentRoom).emit("chat message", newMessage, currentRoom);

            if (!messages[currentRoom]) messages[currentRoom] = [];
            messages[currentRoom].push(newMessage);
        }
        
        // io.emit("chat message", newMessage);
        // data.push(newMessage);

        // setData(data);
    });

    socket.on("disconnect", (val) => {
        console.log("Usuário desconectado:", socket.username);

        if (socket.username) {
            users = users.filter((user) => user !== socket.username);
            io.emit("get users", users);
        }
    });
});

http.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});