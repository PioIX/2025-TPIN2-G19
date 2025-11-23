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
    origin: "*", // Permitir el origen localhost:3000
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

app.use(sessionMiddleware)

//PROYECTO
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
app.get('/room', async (req, res) => {
  const { joinCode } = req.query;

  try {
    const room = await realizarQuery(`
      SELECT * FROM GameRooms WHERE joinCode = ${joinCode}
    `);
    console.log("ROOM ENDPOINT: ", room);

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
app.get('/usersInRoom', async function (req, res) {
  const { joinCode } = req.query;
  try {
    const response = await realizarQuery(`
            SELECT Users.userId, Users.username, Users.photo
            FROM Users
            INNER JOIN UsersXRooms ON Users.userId = UsersXRooms.userId
            INNER JOIN GameRooms on GameRooms.gameRoomId= UsersXRooms.gameRoomId
            WHERE GameRooms.joinCode = '${joinCode}';   
        `)
    console.log("Usuarios dentro de la sala: ", response)
    res.send(response)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error al obtener usuarios" })
  }
})

app.get('/photoUsersInRoom', async function (req, res) {
  const { joinCode } = req.query;
  try {
    console.log("Entre1")
    const response = await realizarQuery(`
            SELECT Users.photo
            FROM Users
            INNER JOIN UsersXRooms ON Users.userId = UsersXRooms.userId WHERE UsersXRooms.gameRoomId = ${joinCode}    
        `)
    res.send(response)

  } catch (error) {
    console.log(error)
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

// ========= END POINT SOLUCION ===============
const solucionesPorSala = {};
const games = {};

app.post("/iniciarPartida", async (req, res) => {
  const { joinCode, cardsCharacters, cardsWeapons, cardsRooms } = req.body;
  console.log("Iniciar partida con:", { joinCode, cardsCharacters, cardsWeapons, cardsRooms });
  if (!joinCode) {
    return res.status(400).json({ error: "Falta joinCode" });
  }

  try {
    const jugadores = await realizarQuery(`
      SELECT Users.userId, Users.username, Users.photo
      FROM Users
      INNER JOIN UsersXRooms ON Users.userId = UsersXRooms.userId
      INNER JOIN GameRooms ON GameRooms.gameRoomId = UsersXRooms.gameRoomId
      WHERE GameRooms.joinCode = '${joinCode}';
    `);

    if (!jugadores || jugadores.length === 0) {
      return res.status(400).json({ error: "No hay jugadores en la sala" });
    }

    const characters = [...cardsCharacters];
    const weapons = [...cardsWeapons];
    const rooms = [...cardsRooms];

    const solucion = {
      asesino: characters.splice(Math.floor(Math.random() * characters.length), 1)[0],
      arma: weapons.splice(Math.floor(Math.random() * weapons.length), 1)[0],
      habitacion: rooms.splice(Math.floor(Math.random() * rooms.length), 1)[0],
    };
    console.log("Solución seleccionada:", solucion);

    const mazoRestante = [...characters, ...weapons, ...rooms].sort(() => Math.random() - 0.5);
    const manos = {};
    jugadores.forEach(j => manos[j.userId] = []);

    let turno = 0;
    for (const carta of mazoRestante) {
      const userId = jugadores[turno].userId;
      manos[userId].push(carta);
      turno = (turno + 1) % jugadores.length;
    }

    solucionesPorSala[joinCode] = solucion;

    console.log("🔍 Buscando game con joinCode:", joinCode);
    console.log("🔍 Games disponibles:", Object.keys(games));

    const game = games[joinCode];

    if (!game) {
      console.error("❌ No existe game para joinCode:", joinCode);
      return res.status(500).json({ error: "Sala no inicializada en socket" });
    }

    console.log("✅ Game encontrado:", game.players.map(p => ({
      userId: p.userId,
      username: p.username,
      socketId: p.socketId
    })));

    game.players.forEach(player => {
      const cartasJugador = manos[player.userId];

      if (!player.socketId) {
        console.error(`❌ No hay socketId para ${player.username} (${player.userId})`);
        return;
      }

      io.to(player.socketId).emit("cartas_repartidas", cartasJugador);
      console.log(`✅ Cartas enviadas a ${player.username}:`, cartasJugador.length, "cartas");
    });

    res.json({
      ok: true,
      jugadores: jugadores.map(j => j.userId),
      mensaje: "Cartas repartidas con éxito"
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al iniciar partida" });
  }
});

app.get('/users', async function (req, res) {
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


app.delete('/deleteUsersInRoom', async function (req, res) {
  try {
    const response = await realizarQuery(`
      DELETE FROM UsersXRooms WHERE userId = ${req.body.userId}  
    `)
    res.send(response)
  } catch (error) {
    console.log(error)
  }
})

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
  const { joinCode, playerId } = req.body;

  try {
    // Buscar sala por joinCode
    const roomResponse = await realizarQuery(`
      SELECT * FROM GameRooms WHERE joinCode = ${joinCode}
    `);
    console.log(roomResponse)

    if (roomResponse.length === 0) {
      return res.status(404).send({ error: "Sala no encontrada" });
    }

    const room = roomResponse[0]; // acá tenés gameRoomId también

    // Verificar si el usuario ya está en ESTA sala
    const alreadyJoined = await realizarQuery(`
      SELECT * FROM UsersXRooms 
      WHERE userId = ${playerId} AND gameRoomId = ${room.gameRoomId}
    `);

    if (alreadyJoined.length > 0) {
      return res.status(400).send({ error: "Ya estás en esta sala" });
    }

    // Insertar en UsersXRooms usando gameRoomId REAL
    await realizarQuery(`
      INSERT INTO UsersXRooms (userId, gameRoomId)
      VALUES (${playerId}, ${room.gameRoomId})
    `);

    res.send({
      mensaje: "Unido a la sala con éxito",
      roomId: room.joinCode,     // <-- esto se guarda en el front
      gameRoomId: room.gameRoomId // <-- si lo necesitás después
    });

  } catch (error) {
    console.error("Error al unirse a la sala:", error);
    res.status(500).send({ error: "Error al unirse a la sala" });
  }
});


//SOCKET 

const activeHypothesis = new Map();

io.on("connection", (socket) => {
  const req = socket.request;
  console.log("🔌 Nuevo socket conectado:", socket.id);

  // --- Unirse a la sala ---
  socket.on("joinRoom", (data) => {
    if (req.session?.room) socket.leave(req.session.room);

    req.session = req.session || {};
    req.session.room = data.room;
    socket.join(req.session.room);
    socket.playerId = data.playerId;
    socket.joinCode = data.joinCode;

    const roomKey = data.joinCode;

    if (!games[roomKey]) {
      games[roomKey] = { players: [], currentTurn: 0, started: false };
    }
    
    const game = games[roomKey];
    const existingPlayer = game.players.find(p => p.userId === data.playerId);
    
    if (existingPlayer) {
      existingPlayer.socketId = socket.id;
      console.log(`♻️ Jugador ${data.playerId} reconectado con socket ${socket.id}`);
    } else {
      game.players.push({
        userId: data.playerId,
        username: data.username || "Jugador",
        socketId: socket.id,
        position: null,
        turnOrder: game.players.length
      });
      console.log(`➕ Jugador ${data.playerId} agregado a ${roomKey}`);
    }

    console.log(`📊 Jugadores en ${roomKey}:`, game.players.map(p => p.username));

    io.to(req.session.room).emit("playerJoined", { 
      room: req.session.room, 
      players: game.players,
      timestamp: new Date() 
    });
  });

  socket.on("gameStarted", ({ room }) => {
    const game = games[room];
    if (!game) return;

    game.started = true;

    // Avisar a todos los jugadores que el juego empezó
    io.to(room).emit("gameStarted", { message: "El juego comenzó" });

    console.log(`🎮 Juego iniciado en sala ${room}`);
  });

  // --- Inicializar juego ---
  socket.on("initializeGame", ({ joinCode }) => {
    const game = games[joinCode];
    if (!game) {
      console.error("❌ No existe game para:", joinCode);
      return;
    }

    // Asignar posiciones iniciales (salidas)
    const salidas = [
      { x: 0, y: 7 },   // Salida 1
      { x: 5, y: 0 },   // Salida 2
      { x: 6, y: 15 },  // Salida 3
      { x: 11, y: 9 }   // Salida 4
    ];
    
    game.players.forEach((p, i) => {
      p.position = salidas[i % salidas.length];
      p.turnOrder = i;
    });

    game.started = true;
    game.currentTurn = 0;

    console.log(`🚀 Juego inicializado en ${joinCode}. Turno inicial: 0`);

    // Enviar a todos los jugadores
    io.to(joinCode).emit("gameInitialized", { 
      players: game.players, 
      currentTurn: game.currentTurn 
    });
  });

  // --- Tirar dado ---
  socket.on("rollDice", ({ joinCode, playerId, diceValue }) => {
    const game = games[joinCode];
    if (!game) return;

    const player = game.players.find(p => p.userId === playerId);
    if (!player || player.turnOrder !== game.currentTurn) {
      console.warn("⚠️ No es el turno de", playerId);
      return;
    }

    console.log(`🎲 ${playerId} tiró ${diceValue}`);

    // Enviar a todos
    io.to(joinCode).emit("diceRolled", { 
      playerId, 
      diceValue,
      currentTurn: game.currentTurn 
    });
  });

  // --- Mover jugador ---
  socket.on("movePlayer", ({ joinCode, playerId, newPosition }) => {
    const game = games[joinCode];
    if (!game) return;

    const player = game.players.find(p => p.userId === playerId);
    if (!player) return;

    if (player.turnOrder !== game.currentTurn) {
      console.warn("⚠️ No es el turno de", playerId);
      return;
    }

    player.position = newPosition;
    console.log(`🚶 ${playerId} se movió a (${newPosition.x}, ${newPosition.y})`);

    io.to(joinCode).emit("playerMoved", { 
      playerId, 
      newPosition 
    });
  });

  // --- Cambiar turno ---
  socket.on("changeTurn", ({ joinCode, nextTurn }) => {
    console.log("========================================");
    console.log("📨 Evento changeTurn recibido:");
    console.log("   - joinCode:", joinCode);
    console.log("   - nextTurn solicitado:", nextTurn);
    
    const game = games[joinCode];
    if (!game) {
      console.error("❌ No existe game para joinCode:", joinCode);
      console.log("   - Games disponibles:", Object.keys(games));
      console.log("========================================");
      return;
    }

    const previousTurn = game.currentTurn;
    game.currentTurn = nextTurn % game.players.length;
    
    console.log("✅ Turno cambiado exitosamente:");
    console.log("   - Turno anterior:", previousTurn);
    console.log("   - Turno nuevo:", game.currentTurn);
    console.log("   - Jugador actual:", game.players[game.currentTurn]?.username);
    console.log("   - Emitiendo a sala:", joinCode);
    console.log("========================================");

    // Emitir a TODOS los jugadores en la sala
    io.to(joinCode).emit("turnChanged", { 
      currentTurn: game.currentTurn,
      previousTurn: previousTurn,
      currentPlayer: game.players[game.currentTurn]
    });
  });

  // --- Repartir cartas (alternativo por socket) ---
  socket.on("repartirCartas", ({ joinCode }) => {
    const game = games[joinCode];
    if (!game) return;

    const cartasPorJugador = {};
    game.players.forEach(player => {
      cartasPorJugador[player.userId] = [
        { characterName: "Señorita Escarlata" },
        { weaponName: "Revólver" },
        { roomName: "Biblioteca" }
      ];
    });

    game.players.forEach(player => {
      if (player.socketId) {
        io.to(player.socketId).emit("cartas_repartidas", cartasPorJugador[player.userId]);
        console.log(`🃏 Cartas enviadas a ${player.userId}`);
      }
    });
  });

  socket.on("makeHypothesis", ({ joinCode, playerId, hypothesis }) => {
    console.log("========================================");
    console.log("📢 Hipótesis recibida:");
    console.log("   - joinCode:", joinCode);
    console.log("   - playerId:", playerId);
    console.log("   - hypothesis:", hypothesis);
    
    const game = games[joinCode];
    if (!game) {
      console.error("❌ Sala no encontrada:", joinCode);
      console.log("========================================");
      return;
    }

    const player = game.players.find(p => p.userId === playerId);
    if (!player) {
      console.error("❌ Jugador no encontrado:", playerId);
      console.log("========================================");
      return;
    }

    // Crear cola de respuesta (todos los jugadores excepto quien hizo la hipótesis)
    // El orden comienza con el siguiente jugador en el turno
    const currentTurnIndex = game.players.findIndex(p => p.turnOrder === game.currentTurn);
    const responderQueue = [];
    
    console.log("   - Turno actual index:", currentTurnIndex);
    console.log("   - Total jugadores:", game.players.length);
    
    for (let i = 1; i < game.players.length; i++) {
      const nextIndex = (currentTurnIndex + i) % game.players.length;
      const nextPlayer = game.players[nextIndex];
      if (nextPlayer.userId !== playerId) {
        responderQueue.push({
          userId: nextPlayer.userId,
          username: nextPlayer.username || `Jugador ${nextPlayer.userId}`
        });
        console.log(`   - Agregado a cola: ${nextPlayer.username} (${nextPlayer.userId})`);
      }
    }

    if (responderQueue.length === 0) {
      console.error("❌ No hay otros jugadores para responder");
      console.log("========================================");
      return;
    }

    // Guardar hipótesis activa
    activeHypothesis.set(joinCode, {
      hypothesis,
      playerId,
      playerName: player.username || `Jugador ${playerId}`,
      responderQueue,
      currentResponderIndex: 0
    });

    const currentResponder = responderQueue[0];

    console.log("✅ Hipótesis guardada exitosamente");
    console.log("   - Primer respondedor:", currentResponder.username);
    console.log("========================================");

    // Anunciar hipótesis a todos los jugadores
    io.to(joinCode).emit("hypothesisAnnounced", {
      playerId,
      playerName: player.username || `Jugador ${playerId}`,
      hypothesis,
      currentResponderId: currentResponder.userId,
      currentResponderName: currentResponder.username
    });

    console.log("📤 Hipótesis anunciada a todos en sala:", joinCode);
  });

  // --- Responder a una hipótesis ---
  socket.on("respondHypothesis", ({ joinCode, playerId, cardRevealed }) => {
    console.log("========================================");
    console.log("💬 Respuesta de hipótesis recibida:");
    console.log("   - joinCode:", joinCode);
    console.log("   - playerId:", playerId);
    console.log("   - cardRevealed:", cardRevealed);

    const hypothesisData = activeHypothesis.get(joinCode);
    if (!hypothesisData) {
      console.error("❌ No hay hipótesis activa para:", joinCode);
      console.log("========================================");
      return;
    }

    const game = games[joinCode];
    if (!game) {
      console.error("❌ Sala no encontrada:", joinCode);
      console.log("========================================");
      return;
    }

    const responder = game.players.find(p => p.userId === playerId);
    if (!responder) {
      console.error("❌ Jugador respondedor no encontrado:", playerId);
      console.log("========================================");
      return;
    }

    // Si el jugador tiene una carta para revelar
    if (cardRevealed) {
      console.log("✅ Carta revelada:", cardRevealed);
      console.log("   - Por jugador:", responder.username);
      
      // Enviar resultado a todos
      io.to(joinCode).emit("hypothesisResult", {
        cardRevealed,
        responderName: responder.username || `Jugador ${playerId}`,
        responderId: playerId,
        hypothesisPlayerId: hypothesisData.playerId
      });

      // Limpiar hipótesis activa
      activeHypothesis.delete(joinCode);

      // Pasar al siguiente turno
      const nextTurn = (game.currentTurn + 1) % game.players.length;
      game.currentTurn = nextTurn;
      
      console.log("⏭️ Pasando al siguiente turno:", nextTurn);
      
      io.to(joinCode).emit("turnChanged", { 
        currentTurn: nextTurn,
        previousTurn: game.currentTurn,
        currentPlayer: game.players[nextTurn]
      });

      console.log("✅ Hipótesis resuelta con carta revelada");
      console.log("========================================");
      return;
    }

    // Si no tiene carta, pasar al siguiente en la cola
    console.log("➡️ Jugador no tiene carta, pasando al siguiente...");
    hypothesisData.currentResponderIndex++;

    // Si llegamos al final de la cola (nadie tiene cartas)
    if (hypothesisData.currentResponderIndex >= hypothesisData.responderQueue.length) {
      console.log("❌ Nadie tiene ninguna de las cartas");
      
      // Nadie tiene ninguna de las cartas
      io.to(joinCode).emit("hypothesisResult", {
        cardRevealed: null,
        responderName: null,
        responderId: null,
        hypothesisPlayerId: hypothesisData.playerId
      });

      // Limpiar hipótesis activa
      activeHypothesis.delete(joinCode);

      // Pasar al siguiente turno
      const nextTurn = (game.currentTurn + 1) % game.players.length;
      game.currentTurn = nextTurn;
      
      console.log("⏭️ Pasando al siguiente turno:", nextTurn);
      
      io.to(joinCode).emit("turnChanged", { 
        currentTurn: nextTurn,
        previousTurn: game.currentTurn,
        currentPlayer: game.players[nextTurn]
      });

      console.log("✅ Hipótesis finalizada - nadie tiene cartas");
      console.log("========================================");
      return;
    }

    // Pedir al siguiente jugador que responda
    const nextResponder = hypothesisData.responderQueue[hypothesisData.currentResponderIndex];
    
    console.log("➡️ Solicitando respuesta a:", nextResponder.username);
    
    io.to(joinCode).emit("hypothesisAnnounced", {
      playerId: hypothesisData.playerId,
      playerName: hypothesisData.playerName,
      hypothesis: hypothesisData.hypothesis,
      currentResponderId: nextResponder.userId,
      currentResponderName: nextResponder.username
    });

    console.log("✅ Siguiente respuesta solicitada");
    console.log("========================================");
  });

  // --- Desconexión (ya existente, no modificar) ---
  socket.on("disconnect", () => {
    console.log("❌ Socket desconectado:", socket.id);
    
    if (socket.playerId && socket.joinCode) {
      const game = games[socket.joinCode];
      if (game) {
        const player = game.players.find(p => p.socketId === socket.id);
        if (player) {
          console.log(`👋 ${player.username} se desconectó`);
          io.to(socket.joinCode).emit("playerLeft", { playerId: socket.playerId });
        }
      }
    }
  });

});