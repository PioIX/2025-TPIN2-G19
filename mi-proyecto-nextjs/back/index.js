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

app.post('/createCode', async (req, res) => {
  const { name, players, admin } = req.body;

  console.log('📥 Petición recibida:', { name, players, admin });

  try {
    // Generar código único de 4 dígitos
    let joinCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log('🎲 Código generado:', joinCode);
    
    // Verificar que el código no exista ya
    let existingRoom = await realizarQuery(`
      SELECT * FROM GameRooms WHERE joinCode = '${joinCode}'
    `);
    
    // Si existe, generar otro código (máximo 10 intentos)
    let attempts = 0;
    while (existingRoom.length > 0 && attempts < 10) {
      joinCode = Math.floor(1000 + Math.random() * 9000).toString();
      console.log('🔄 Código ya existe, generando nuevo:', joinCode);
      existingRoom = await realizarQuery(`
        SELECT * FROM GameRooms WHERE joinCode = '${joinCode}'
      `);
      attempts++;
    }

    if (attempts >= 10) {
      console.error('❌ No se pudo generar código único después de 10 intentos');
      return res.status(500).json({ error: "Error al generar código único" });
    }

    console.log('✅ Código único confirmado:', joinCode);

    // Crear la sala con el código generado - IMPORTANTE: incluir joinCode en el INSERT
    const insertQuery = `
      INSERT INTO GameRooms (nameRoom, admin, players, joinCode)
      VALUES ('${name}', ${admin}, ${players}, '${joinCode}')
    `;

    console.log('📝 Query:', insertQuery);
    const response = await realizarQuery(insertQuery);
    const roomId = response.insertId;

    console.log('✅ Sala insertada con ID:', roomId);

    // Insertar al admin en la sala
    await realizarQuery(`
      INSERT INTO UsersXRooms (userId, gameRoomId)
      VALUES (${admin}, ${roomId})
    `);

    console.log('✅ Admin agregado a UsersXRooms');

    // Verificar que el joinCode se guardó correctamente
    const verificacion = await realizarQuery(`
      SELECT * FROM GameRooms WHERE gameRoomId = ${roomId}
    `);
    
    console.log('🔍 Verificación de sala creada:', verificacion[0]);

    if (!verificacion[0].joinCode) {
      console.error('⚠️ ALERTA: joinCode es NULL en la base de datos!');
      return res.status(500).json({ error: "Error al guardar el código de sala" });
    }

    // Devolver respuesta
    res.json({ 
      roomId, 
      joinCode: verificacion[0].joinCode, // Usar el joinCode de la verificación
      mensaje: "Sala creada con éxito" 
    });

  } catch (error) {
    console.error("💥 Error al crear la sala:", error);
    res.status(500).json({ error: "Error al crear la sala: " + error.message });
  }
});



// Agregar este endpoint nuevo
app.get('/room/:gameRoomId', async (req, res) => {
  const { gameRoomId } = req.params;
  
  try {
    const room = await realizarQuery(`
      SELECT * FROM GameRooms WHERE gameRoomId = ${gameRoomId}
    `);
    
    if (room.length === 0) {
      return res.status(404).json({ error: "Sala no encontrada" });
    }
    
    res.json(room[0]);
  } catch (error) {
    console.error("Error al obtener sala:", error);
    res.status(500).json({ error: "Error al obtener la sala" });
  }
});

// Modificar el endpoint usersInRoom para devolver más datos
app.get('/usersInRoom', async function(req,res){
    try {
        const response = await realizarQuery(`
            SELECT Users.userId, Users.username, Users.photo
            FROM Users
            INNER JOIN UsersXRooms ON Users.userId = UsersXRooms.userId
            WHERE UsersXRooms.gameRoomId = ${req.query.gameRoomId}    
        `)
        res.send(response)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al obtener usuarios" })
    }
})

// Endpoint para obtener usuario por ID
app.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id
    console.log('🔍 GET /user/:id - Buscando usuario ID:', userId)
    
    const results = await realizarQuery(`
      SELECT userId, username, email, photo, wins, admin 
      FROM Users 
      WHERE userId = ${userId}
    `)
    
    if (results.length === 0) {
      console.log('❌ Usuario no encontrado')
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    
    const user = results[0]
    console.log('✅ Usuario encontrado:', user)
    console.log('📊 Campo admin:', user.admin, '| Tipo:', typeof user.admin)
    
    // Asegurar que admin sea un número
    user.admin = Number(user.admin)
    
    res.json(user)
    
  } catch (error) {
    console.error('💥 Error al obtener usuario:', error)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

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

// ========== ENDPOINTS PARA ARMAS ==========

// Obtener todas las armas
app.get('/weapons', async (req, res) => {
  try {
    console.log('📋 GET /weapons - Obteniendo todas las armas')
    
    const results = await realizarQuery(`SELECT * FROM Weapons ORDER BY name`)
    
    console.log(`✅ ${results.length} armas encontradas`)
    res.json(results)
    
  } catch (error) {
    console.error('💥 Error al obtener armas:', error)
    res.status(500).json({ error: 'Error al obtener armas' })
  }
})

// Agregar un arma
app.post('/weapons', async (req, res) => {
  try {
    const { name } = req.body
    console.log('➕ POST /weapons - Agregando arma:', name)
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del arma es requerido' })
    }

    // Verificar si ya existe
    const existing = await realizarQuery(`SELECT * FROM Weapons WHERE name = '${name.trim()}'`)
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Esta arma ya existe' })
    }

    const result = await realizarQuery(`INSERT INTO Weapons (name) VALUES ('${name.trim()}')`)
    
    console.log('✅ Arma agregada con ID:', result.insertId)
    res.json({ message: 'Arma agregada con éxito', weaponId: result.insertId })
    
  } catch (error) {
    console.error('💥 Error al agregar arma:', error)
    res.status(500).json({ error: 'Error al agregar arma' })
  }
})

// Eliminar un arma
app.delete('/weapons/:id', async (req, res) => {
  try {
    const weaponId = req.params.id
    console.log('🗑️ DELETE /weapons/:id - Eliminando arma ID:', weaponId)
    
    const result = await realizarQuery(`DELETE FROM Weapons WHERE weaponId = ${weaponId}`)
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Arma no encontrada' })
    }
    
    console.log('✅ Arma eliminada')
    res.json({ message: 'Arma eliminada con éxito' })
    
  } catch (error) {
    console.error('💥 Error al eliminar arma:', error)
    res.status(500).json({ error: 'Error al eliminar arma' })
  }
})

// ========== ENDPOINTS PARA PERSONAJES ==========

// Obtener todos los personajes
app.get('/characters', async (req, res) => {
  try {
    console.log('📋 GET /characters - Obteniendo todos los personajes')
    
    const results = await realizarQuery(`SELECT * FROM Characters ORDER BY name`)
    
    console.log(`✅ ${results.length} personajes encontrados`)
    res.json(results)
    
  } catch (error) {
    console.error('💥 Error al obtener personajes:', error)
    res.status(500).json({ error: 'Error al obtener personajes' })
  }
})

// Agregar un personaje
app.post('/characters', async (req, res) => {
  try {
    const { name } = req.body
    console.log('➕ POST /characters - Agregando personaje:', name)
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del personaje es requerido' })
    }

    // Verificar si ya existe
    const existing = await realizarQuery(`SELECT * FROM Characters WHERE name = '${name.trim()}'`)
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Este personaje ya existe' })
    }

    const result = await realizarQuery(`INSERT INTO Characters (name) VALUES ('${name.trim()}')`)
    
    console.log('✅ Personaje agregado con ID:', result.insertId)
    res.json({ message: 'Personaje agregado con éxito', characterId: result.insertId })
    
  } catch (error) {
    console.error('💥 Error al agregar personaje:', error)
    res.status(500).json({ error: 'Error al agregar personaje' })
  }
})

// Eliminar un personaje
app.delete('/characters/:id', async (req, res) => {
  try {
    const characterId = req.params.id
    console.log('🗑️ DELETE /characters/:id - Eliminando personaje ID:', characterId)
    
    const result = await realizarQuery(`DELETE FROM Characters WHERE characterId = ${characterId}`)
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Personaje no encontrado' })
    }
    
    console.log('✅ Personaje eliminado')
    res.json({ message: 'Personaje eliminado con éxito' })
    
  } catch (error) {
    console.error('💥 Error al eliminar personaje:', error)
    res.status(500).json({ error: 'Error al eliminar personaje' })
  }
})


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
        console.log("USERS IN ROOM")
        const response = await realizarQuery(`
            SELECT DISTINCT Users.username
            FROM Users
            INNER JOIN UsersXRooms ON UsersXRooms.userId = Users.userId
            WHERE UsersXRooms.gameRoomId = ${req.body.roomId};
        `)
        console.log("RESPONSE: ", response)
        res.send(response)
    } catch (error) {
        console.log(error)
    }
})

app.get('/photoUsersInRoom', async function(req,res){
    try {
        console.log("Entre1")
        const response = await realizarQuery(`
            SELECT Users.photo FROM Users INNER JOIN UsersXRooms ON Users.userId = UsersXRooms.userId WHERE UsersXRooms.gameRoomId = ${req.query.gameRoomId}    
        `)
        res.send(response)
        
    } catch (error) {
        console.log(error)
    }
})

app.delete('/deleteUsersInRoom', async function (req,res) {
  try {
    const response = await realizarQuery(`
      DELETE FROM UsersXRooms WHERE userId = ${req.body.userId}  
    `)
    res.send(response)
  } catch (error) {
    console.log(error)
  }
})

// SOCKET


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
  const { name, players, admin } = req.body;
  console.log({ name, players, admin })
  try {
    // Crear la sala
    const insertQuery = `
      INSERT INTO GameRooms (nameRoom, admin, players)
      VALUES ('${name}', ${admin}, ${players})
    `;

    const response = await realizarQuery(insertQuery);
    const roomId = response.insertId;

    await realizarQuery(`
    INSERT INTO UsersXRooms (userId, gameRoomId)
    VALUES (${admin}, ${roomId})
    `);
      console.log(roomId)
    res.send({ roomId: roomId });
  } catch (error) {
    console.error("Error al crear la sala:", error);
    res.status(500).send("Error al crear la sala");
  }
});


app.post('/joinroom', async (req, res) => {
  const { joinCode, playerId } = req.body; // joinCode = gameRoomId
  console.log(joinCode, playerId)

  try {
    // Verificar que la sala existe
    const roomResponse = await realizarQuery(`
      SELECT * FROM GameRooms WHERE gameRoomId = ${joinCode}
    `);

    if (roomResponse.length< 0) {
      return res.status(404).send("Sala no encontrada");
    }

    const room = roomResponse[0];

    // Contar cuántos jugadores ya están en la sala
    const playersResponse = await realizarQuery(`
      SELECT COUNT(*) as count FROM UsersXRooms WHERE gameRoomId = ${joinCode}
    `);

    const currentPlayers = playersResponse[0].count;

    // Verificar que el jugador no esté ya en la sala
    /*const alreadyJoined = await realizarQuery(`
      SELECT * FROM UsersXRooms WHERE gameRoomId = ${joinCode} AND userId = ${playerId}
    `);

    console.log("alreadyJoin: ", alreadyJoined)

    if (alreadyJoined.length > 0) {
      return res.status(400).send("Ya estás en esta sala");
    }*/

    let codigo = realizarQuery(`
      SELECT gameRoomId FROM GameRooms WHERE joinCode = ${joinCode})
    `);
    
    // Insertar al jugador en la tabla relacional
    await realizarQuery(`
      INSERT INTO UsersXRooms (userId, gameRoomId)
      VALUES (${playerId}, ${codigo[0].gameRoomId})
    `);

    res.send({ mensaje: "Unido a la sala con éxito", roomId: joinCode });

  } catch (error) {
    console.error("Error al unirse a la sala:", error);
    res.status(500).send({res:"Error al unirse a la sala"});
  }
});

io.on("connection", (socket) => {
    const req = socket.request;
    
    socket.on("joinRoom", (data) => {
        if (req.session.room != undefined && req.session.room.length > 0) {
            socket.leave(req.session.room);
        }
        req.session.room = data.room;
        socket.join(req.session.room);
        console.log("🚪 Usuario se unió a la sala:", req.session.room);
        
        // Notificar a todos en la sala que un jugador se unió
        io.to(req.session.room).emit("playerJoined", {
            room: req.session.room,
            timestamp: new Date()
        });
    });

    socket.on("startGame", (data) => {
        console.log("🎮 Iniciando juego en sala:", data.room);
        io.to(data.room).emit("gameStarted", { room: data.room });
    });

    socket.on("sendMessage", (data) => {
        io.to(req.session.room).emit("newMessage", {
            room: req.session.room,
            message: data,
        });
    });

    socket.on("disconnect", () => {
        console.log("👋 Usuario desconectado");
    });
});


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

