var express = require('express'); //Tipo de servidor: Express
var bodyParser = require('body-parser'); //Convierte los JSON
var cors = require('cors');
const { realizarQuery } = require('./modulos/mysql');
const session = require("express-session"); 

var app = express(); //Inicializo express
var port = process.env.PORT || 4000; //Ejecuto el servidor en el puerto 3000

// Convierte una petición recibida (POST-GET...) a objeto JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', function (req, res) {
    res.status(200).send({
        message: 'GET Home route working fine!'
    });
});

//Pongo el servidor a escuchar
const server = app.listen(port, () => {
console.log(`Servidor NodeJS corriendo en http://localhost:${port}/`);
});

const io = require("socket.io")(server, {
cors: {
origin: ["http://localhost:3000", "http://localhost:3001"], // Permitir el origen localhost:3000
methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
credentials: true, // Habilitar el envío de cookies
},
});



const sessionMiddleware = session({
//Elegir tu propia key secreta
secret: "sebasnoentra",
resave: false,
saveUninitialized: false,
});

app.use(sessionMiddleware);
io.use((socket, next) => {
sessionMiddleware(socket.request, {}, next);
});

// -------------- aca comienza el proyecto del chat


app.get('/users', async function(req,res){
    try {
        console.log("Entre")
        const response = await realizarQuery(`
            SELECT * FROM Users    
        `)
        res.send(response)
        
    } catch (error) {
        console.log(error)
    }
})

app.get('/usersInRoom', async function(req,res){
    try {
        console.log("Entre")
        const response = await realizarQuery(`
            SELECT Users.username, Users.photo FROM Users INNER JOIN UsersXRooms ON Users.userId = UsersXRooms.userId WHERE UsersXRooms.roomId = ${room}    
        `)
        res.send(response)
        
    } catch (error) {
        console.log(error)
    }
})

io.on("connection", (socket) => {
    const req = socket.request;
    socket.on("joinRoom", (data) => {
        if (req.session.room != undefined && req.session.room.length > 0)
            socket.leave(req.session.room);
            req.session.room = data.room;
            socket.join(req.session.room);
            console.log("🚀 ~ io.on ~ req.session.room:", req.session.room);
            io.to(req.session.room).emit("chat-messages", {
                user: req.session.user,
                room: req.session.room,
        });
    });
    socket.on("pingAll", (data) => {
        console.log("PING ALL: ", data);
        io.emit("pingAll", { event: "Ping to all", message: data });
    });
   socket.on("sendMessage", (data) => {
        io.to(req.session.room).emit("newMessage", {
            room: req.session.room,
            message: data,
        });
    });
    socket.on("disconnect", () => {
        console.log("Disconnect");
    });
});