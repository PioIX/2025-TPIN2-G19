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
app.post('/crearSala', async (req, res) => {
  const { nameRoom, adminId, players, rooms } = req.body; // Recibir datos desde el frontend

  try {
    // Primero, asignamos las habitaciones a la sala
    // Suponiendo que 'rooms' es un array con roomId, como [1, 2, 3, 4]
    const selectedRooms = JSON.stringify(rooms);  // Convertir las habitaciones a formato JSON

    // Insertar sala en GameRooms
    const query = `
      INSERT INTO GameRooms (nameRoom, admin, players, rooms)
      VALUES ('${nameRoom}', ${adminId}, '${JSON.stringify(players)}', '${selectedRooms}')
    `;
    const response = await realizarQuery(query);

    // Obtener el ID de la sala creada
    const roomId = response.insertId;

    // Devolver la ID de la nueva sala al frontend
    res.send({ mensaje: "Sala creada con éxito", roomId });
  } catch (error) {
    console.error("Error al crear la sala:", error);
    res.status(500).send("Error al crear la sala");
  }
});

app.get('/rooms', async (req, res) => {
  try {
    const response = await realizarQuery(`
      SELECT * FROM Rooms
    `);
    res.send(response);  // Devolver todas las habitaciones
  } catch (error) {
    console.error("Error al obtener las habitaciones:", error);
    res.status(500).send("Error al obtener las habitaciones");
  }
});

app.post('/unirseSala', async (req, res) => {
  const { userId, roomId } = req.body;

  try {
    // Primero, obtener la sala
    const roomResponse = await realizarQuery(`
      SELECT * FROM GameRooms WHERE gameRoomId = ${roomId}
    `);

    if (roomResponse.length === 0) {
      return res.status(404).send("Sala no encontrada");
    }

    const room = roomResponse[0];
    let players = JSON.parse(room.players);  // Convertir de vuelta el JSON de players
    players.push(userId);  // Agregar el ID del jugador a la lista

    // Actualizar la sala con el nuevo jugador
    await realizarQuery(`
      UPDATE GameRooms SET players = '${JSON.stringify(players)}'
      WHERE gameRoomId = ${roomId}
    `);

    // Obtener las habitaciones asociadas a la sala
    let rooms = JSON.parse(room.rooms);  // Las habitaciones disponibles para esa sala
    res.send({ mensaje: "Jugador añadido a la sala", roomId, rooms });
  } catch (error) {
    console.error("Error al unirse a la sala:", error);
    res.status(500).send("Error al unirse a la sala");
  }
});

app.post('/realizarAcusacion', async (req, res) => {
  const { jugadorId, sospechoso, arma, lugar, roomId } = req.body;

  try {
    // Buscar la sala y los datos correctos de la acusación
    const roomResponse = await realizarQuery(`
      SELECT * FROM GameRooms WHERE gameRoomId = ${roomId}
    `);
    
    if (roomResponse.length === 0) {
      return res.status(404).send("Sala no encontrada");
    }

    const room = roomResponse[0];
    const { sospechosoCorrecto, armaCorrecta, lugarCorrecto } = room;  // Estos valores deben estar en la sala

    if (sospechoso === sospechosoCorrecto && arma === armaCorrecta && lugar === lugarCorrecto) {
      io.to(roomId).emit("notificacion", { mensaje: "¡Acusación correcta!", jugadorId });
      res.send({ resultado: "correcto", mensaje: "¡La acusación fue correcta!" });
    } else {
      io.to(roomId).emit("notificacion", { mensaje: "¡Acusación incorrecta!", jugadorId });
      res.send({ resultado: "incorrecto", mensaje: "¡La acusación fue incorrecta!" });
    }
  } catch (error) {
    console.error("Error al realizar la acusación:", error);
    res.status(500).send("Error al realizar la acusación");
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password, photo, wins, admin } = req.body;
  
  try {
    // Verificar si ya existe un usuario con el mismo email
    const existingUser = await realizarQuery(`
      SELECT * FROM Users WHERE email = '${email}'
    `);
    if (existingUser.length > 0) {
      return res.status(400).send("El email ya está registrado");
    }

    // Insertar el nuevo usuario en la base de datos
    const query = `
      INSERT INTO Users (username, email, password, photo, wins, admin)
      VALUES ('${username}', '${email}', '${password}', '${photo}', ${wins}, ${admin})
    `;
    const response = await realizarQuery(query);

    // Enviar respuesta
    res.send({ mensaje: "Usuario registrado con éxito", userId: response.insertId });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).send("Error al registrar usuario");
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario en la base de datos
    const user = await realizarQuery(`
      SELECT * FROM Users WHERE email = '${email}'
    `);

    if (user.length === 0) {
      return res.status(400).send("Usuario no encontrado");
    }

    // Verificar si la contraseña es correcta (sin bcrypt, se compara directamente)
    if (user[0].password !== password) {
      return res.status(400).send("Contraseña incorrecta");
    }

    // Iniciar sesión del usuario (guardar datos en la sesión si es necesario)
    req.session.userId = user[0].userId;
    req.session.username = user[0].username;
    req.session.isAdmin = user[0].admin;

    // Enviar respuesta con los datos del usuario
    res.send({ mensaje: "Login exitoso", userId: user[0].userId });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).send("Error al iniciar sesión");
  }
});

app.post('/createroom', async (req, res) => {
  const { name, cant_players } = req.body;

  try {
    // Insertar nueva sala en la base de datos
    const query = `
      INSERT INTO GameRooms (nameRoom, cant_players, players) 
      VALUES ('${name}', ${cant_players}, '[]')`; // 'players' se inicia vacío como un array

    const response = await realizarQuery(query);

    // Obtener el ID de la sala creada
    const roomId = response.insertId;

    // Devolver el roomId al frontend
    res.send({ roomId });
  } catch (error) {
    console.error("Error al crear la sala:", error);
    res.status(500).send("Error al crear la sala");
  }
});

app.post('/joinroom', async (req, res) => {
  const { joinCode, playerId } = req.body; // El 'joinCode' sería el 'roomId' de la sala a la que se quiere unir

  try {
    // Validar si el código de sala existe
    const roomResponse = await realizarQuery(`
      SELECT * FROM GameRooms WHERE gameRoomId = ${joinCode}
    `);

    if (roomResponse.length === 0) {
      return res.status(404).send("Sala no encontrada");
    }

    const room = roomResponse[0];
    let players = JSON.parse(room.players);  // Obtener los jugadores de la sala
    if (players.length >= room.cant_players) {
      return res.status(400).send("La sala está llena");
    }

    players.push(playerId);  // Agregar al jugador a la sala

    // Actualizar la lista de jugadores en la base de datos
    await realizarQuery(`
      UPDATE GameRooms SET players = '${JSON.stringify(players)}' 
      WHERE gameRoomId = ${joinCode}
    `);

    // Enviar éxito
    res.send({ mensaje: "Unido a la sala con éxito", roomId: joinCode });
  } catch (error) {
    console.error("Error al unirse a la sala:", error);
    res.status(500).send("Error al unirse a la sala");
  }
});


