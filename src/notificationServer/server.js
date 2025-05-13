const users = {};

const express = require('express');
const app = express();
const server = require('http').createServer(app);

require('dotenv').config();

const io = require('socket.io')(server, {
    cors: true,
    origins: [`http://${process.env.HOST}:${process.env.PORT}`]
});

io.on('connection', socket => {
    // Подключение пользователя
    socket.on('register', userId => {
        users[userId] = socket.id;
        console.info(users);
    });

    // Добавление задачи
    socket.on('addTask', ({ task, assigneeId }) => {
        // console.log(`user id: ${assigneeId}`);
        console.info(task);
        if (users[assigneeId]) {
            io.to(users[assigneeId]).emit('taskAssigned', task);
        }
    });

    // Разрыв соединения
    socket.on('disconnect', () => {
        console.log('A user disconnected');

        for (let userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];
                break;
            }
        }
    });
});

server.listen(process.env.PORT, process.env.HOST, error => {
    error ? console.log(error) : console.log(`Server listening on: ${process.env.HOST}:${process.env.PORT}`);
});
