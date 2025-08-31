const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require('fs').promises;

app.use(express.static("public")); // Servir arquivos da pasta public

let users = [];
let data;

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

        io.emit("get data", data);
    });

    socket.on("new username", (name) => {
        users.push(name);

        socket.username = name;
    });

    socket.on("get users", () => {
        io.emit("get users", users);
    });

    socket.on("chat message", (_username, msg) => {
        let newMessage = { username: _username, msg, localeTime: new Date().toLocaleTimeString(), time: new Date().getTime() };
        io.emit("chat message", newMessage);

        data.push(newMessage);

        setData(data);
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