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



// ACA EMPIEZA EL TRABAJO NUESTRO

/*app.post('/obtenerDatosRegistro'), async function (req,res) {
    try {
         await realizarQuery(`
        ('INSERT INTO Usuarios (nombre_usuario, contraseña, es_admin) VALUES ('${req.body.nombre_usuario}', '${req.body.contraseña}', '${req.body.es_admin}');')
    `)
    res.send("se agrego correctamente")
    } catch(error){
        console.log(error);
    }

}*/
/*
app.post('/guardarUsuarios', async function (req,res) {
    try {
        await realizarQuery(`
        INSERT INTO Usuarios (nombre_usuario,contraseña, es_admin) 
            VALUES ('${req.body.nombre_usuario}', '${req.body.contraseña}', ${req.body.es_admin})
        `)
        res.send({mensaje:"se agrego correctamente"})

    } catch(error){
        console.log(error);
        res.send(error)
    }

})

app.post('/guardarCanciones', async function (req,res) {
    try {
        await realizarQuery(`
        INSERT INTO Canciones (nombre_cancion, nombre_artista, nro_reproducciones) 
            VALUES ('${req.body.nombre_cancion}','${req.body.nombre_artista}', '${req.body.nro_reproducciones}')
        `)
        res.send({mensaje: "se agrego correctamente"})
    } catch(error){
        console.log(error);
        res.send(error)
/*
    } catch(error){
        console.log(error);
        res.send(error)
    }

})

app.post('/guardarCanciones', async function (req,res) {
    try {
        await realizarQuery(`
        INSERT INTO Canciones (nombre_cancion, nombre_artista, nro_reproducciones) 
            VALUES ('${req.body.nombre_cancion}','${req.body.nombre_artista}', '${req.body.nro_reproducciones}')
        `)
        res.send({mensaje: "se agrego correctamente"})
    } catch(error){
        console.log(error);
        res.send(error)

    }

})

app.post('/buscarUsuario', async function(req,res){
    console.log(req.query.nombre_usuario)
    try {
        const response = await realizarQuery(`
            SELECT * FROM Usuarios WHERE nombre_usuario = '${req.body.nombre_usuario}' and contraseña = '${req.body.contraseña}'     
        `)
        console.log(response)
        res.send(response)
    } catch (error) {
        console.log(error)
    }
})


app.post('/conseguirID', async function(req,res){
    const response = await realizarQuery(`
        SELECT idUsuario FROM Usuarios WHERE nombre_usuario = '${req.body.nombre_usuario}'     
    `)
    console.log(response)
    res.send(response) 
})


app.post('/esAdmin', async function(req,res){
    try {
        const response = await realizarQuery(`
            SELECT es_admin FROM Usuarios WHERE nombre_usuario = '${req.body.nombre_usuario}'     
        `)
        console.log(response)
        res.send(response)
    } catch (error) {
        console.log(error)
    }
})


app.get('/usuarios', async function(req,res){
    const response = await realizarQuery(`
        SELECT * FROM Usuarios   
    `)
    console.log(response)
    res.send(response)
})

app.get('/cancionesJuego', async function(req,res){
    try {
        const response = await realizarQuery(`
        SELECT * FROM Canciones ORDER BY RAND()   
    `)
        console.log(response)
        res.json(response)   
    } catch (error) {
        res.send("error obtener canciones")
    }
})

app.get('/traerCanciones', async function(req,res){
    try {
        const response = await realizarQuery(`
        SELECT * FROM Canciones  
    `)
        console.log(response)
        res.json(response)   
    } catch (error) {
        res.send("error obtener canciones")
    }
})


app.get('/mejoresPuntajes', async function (req,res) {
    try {
        const response = await realizarQuery(`
        SELECT nombre_usuario, puntaje FROM Usuarios ORDER BY puntaje DESC LIMIT 5
    `)
        res.send(response)
    } catch (error) {
        res.send("error al ordenar los puntajes")
    }
})

app.post('/agregarPuntaje', async function (req,res) {
    try {
        const response = await realizarQuery(`
        SELECT * FROM Usuarios WHERE idUsuario = '${req.body.idUsuario}'')
    `)
        if (response.length<0){
            await realizarQuery(`
            INSERT INTO Usuarios (nombre_usuario, contraseña, es_admin, puntaje) VALUES ('${req.body.nombre_usuario}','${req.body.contraseña}', '${req.body.es_admin}', '${req.body.contadorPuntaje}')
            `)
        } else {
            await realizarQuery(`
            UPDATE Usuarios SET puntaje = '${req.body.contadorPuntaje}' WHERE idUsuario='${req.body.idUsuario}')
            `)
        }
        res.send("se agregó el puntaje correctamente")
    } catch (error) {
        res.send("error al agregar el puntaje")
    }
})

app.put('/modificarCanciones', async function (req, res) {
    try {
        const result = await realizarQuery(`UPDATE Canciones SET ${req.body.campo}='${req.body.nuevoValor}' WHERE nombre_cancion = '${req.body.cancionSeleccionada}'`);
        res.json(result);
    } catch (error) {
        res.json("error al modificar la canción")
    }
})

app.delete('/eliminarCanciones', async function (req,res) {
    try {
        const result= await realizarQuery(`DELETE FROM Canciones WHERE nombre_cancion="${req.body.cancionSeleccionadaDelete}"`)
        res.json(result)
    } catch (error) {
        
    }
})*/

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


app.get('/mostrarContactos', async function(req,res){
    console.log(req.query.id_user)
    try {
        const response = await realizarQuery(/*`
            SELECT DISTINCT Users.nombre, Users.foto_perfil, Users.id_user
            FROM Users
            INNER JOIN UsersChats on UsersChats.id_user = Users.id_user
            WHERE Users.id_user != '${req.query.id_user}'

            UNION ALL

            SELECT DISTINCT Chats.nombre_chat, Chats.foto_chat, Chats.id_chat
            FROM Chats
            INNER JOIN UsersChats ON UsersChats.id_chat = Chats.id_chat
            INNER JOIN Users ON Users.id_user = UsersChats.id_user
            WHERE Chats.tipo_chat = 'grupo' AND Users.id_user = '${req.query.id_user}';


        `*/
            `SELECT DISTINCT c.id_chat, CASE 
            WHEN c.tipo_chat = 'grupo' THEN c.nombre_chat
            ELSE u2.nombre 
            END AS nombre_chat
            FROM UsersChats uc
            JOIN Chats c ON uc.id_chat = c.id_chat
            LEFT JOIN UsersChats uc2 ON uc2.id_chat = c.id_chat AND uc2.id_user != uc.id_user
            LEFT JOIN Users u2 ON uc2.id_user = u2.id_user
            WHERE uc.id_user = '${req.query.id_user}';`
        )
        console.log("Chats por usuario: ",response)
        res.send(response)   
    } catch (error) {
        console.error(error);
        res.send("error obtener contactos");
    }
})

app.post('/conseguirID', async function(req,res){
    const response = await realizarQuery(`
        SELECT id_user FROM Users WHERE email = '${req.body.email}'     
    `)
    console.log(response)
    res.send(response)
})

app.post('/conseguirUser', async function(req,res){
    const response = await realizarQuery(`
        SELECT * FROM Users WHERE email = '${req.body.email}'     
    `)
    console.log(response)
    res.send(response)
})


app.post('/newChat', async function (req, res) {

    try {


        // 1. Buscar si existe un chat con esa persona
        const existingChat = await realizarQuery(`
            SELECT uc1.id_chat
            FROM UsersChats uc1
            INNER JOIN UsersChats uc2 ON uc1.id_chat = uc2.id_chat
            WHERE uc1.id_user = ${req.body.id_usuarioPropio} AND uc2.id_user = ${req.body.id_usuarioAjeno};    
        `)

        // 2. Verificar si existe
        if (existingChat.length === 1) {
            return res.send({ ok: false, mensaje: "Ya existe un chat entre ustedes", id_chat: existingChat[0].id_chat })
        }


        //3. Crear el chat
        const crearChat = await realizarQuery(`
            INSERT INTO Chats (nombre_chat, fecha_creacion, tipo_chat, foto_chat, id_ultimo_mensaje)   
            VALUES ("", ${Date.now()}, ${req.body.tipo_chat}, "", 0)
        `);

        //4. Buscar nuevo ChatID
        const NuevoChatId = crearChat.insertId // insertId es un mensaje que devuelve predeterminadamente al realizar una sentencia "INSERT INTO"


        await realizarQuery(`
            INSERT INTO UsersChats (id_chat, id_user)
            VALUES (${NuevoChatId}, ${req.body.id_usuarioPropio})        
        `);

        await realizarQuery(`
            INSERT INTO UsersChats (id_chat, id_users)
            VALUES (${NuevoChatId}, ${req.body.id_usuarioAjeno})        
        `);

        res.send({ ok: true, mensaje: "Se ha podido crear el chat y su relacion con éxito.", id_chat: NuevoChatId })
    } catch (error) {
        console.log(error)
        res.status(500).send({ ok: false, mensaje: "Error al crear el chat" })
    }
})









app.post('/seleccionarChat', async function (req,res){
    console.log("mostrar chat seleccionado")
    try {
        /*const response = await realizarQuery(`
            SELECT DISTINCT Chats.nombre_chat, Chats.foto_chat, Chats.id_chat, Chats.tipo_chat
            FROM Chats
            INNER JOIN UsersChats on UsersChats.id_chat = Chats.id_chat
            INNER JOIN Users on Users.id_user = UsersChats.id_user
            WHERE Chats.id_chat='${req.body.id_chat}'
        `)*/
        const response = await realizarQuery(`
            SELECT DISTINCT
            CASE
                WHEN Chats.tipo_chat = 'privado' THEN (
                SELECT Users.nombre
                FROM Users
                INNER JOIN UsersChats UC2 ON Users.id_user = UC2.id_user
                WHERE UC2.id_chat = Chats.id_chat
                    AND Users.id_user <> ${req.body.id_user}
                LIMIT 1
                )
                ELSE Chats.nombre_chat
            END AS nombre_chat,
            Chats.foto_chat,
            Chats.id_chat,
            Chats.tipo_chat
            FROM Chats
            INNER JOIN UsersChats ON UsersChats.id_chat = Chats.id_chat
            INNER JOIN Users ON Users.id_user = UsersChats.id_user
            WHERE Chats.id_chat = '${req.body.id_chat}'
        `)
        console.log("id user:")
        console.log(req.body.id_user)
        console.log(req.body.id_chat)
        console.log("respuesta")
        console.log(response)

        /*for (let i = 0; i < response.length; i++) {
            const chat = response[i];
            let segundaConsulta;
            if (chat.tipo_chat == "privado") {
                console.log("segunda consulta (privado)")
                segundaConsulta = await realizarQuery(`
                    SELECT Users.nombre, Users.foto_perfil
                    FROM Users
                    INNER JOIN UsersChats ON UsersChats.id_user = Users.id_user
                    INNER JOIN Chats ON Chats.id_chat = UsersChats.id_chat
                    WHERE UsersChats.id_chat = '${chat.id_chat}' AND Users.id_user!='${req.body.id_user}';
                `);

            } else {
                console.log("segunda consulta (grupo)")
                segundaConsulta = await realizarQuery(`
                    SELECT Users.nombre, Users.foto_perfil, Users.id_user
                    FROM Users
                    INNER JOIN UsersChats ON UsersChats.id_user = Users.id_user
                    WHERE UsersChats.id_chat = '${chat.id_chat}' AND Users.id_user!='${req.body.id_user}'
                `);
            }
        }*/

        console.log("funcionó")
        console.log(response)
        res.send(response)   
    } catch (error) {
        console.error(error);
        res.send("error obtener contactos");
    }
})

app.post('/obtenerMensajes', async function (req,res){
    try {
        const response = await realizarQuery(`
            SELECT * FROM Messages WHERE id_chat = '${req.body.id_chat}'    
        `);
        res.send(response);
    } catch (error) {
        console.error(error);
        res.send("error al obtener mensajes");
    }
});

app.post("/sendMessage", async (req, res) => {
    try {
        const { content, id_user, id_chat, formattedDate } = req.body;

        if (content.length > 1) {

            await realizarQuery(
                `INSERT INTO Messages(fecha_envio, content, leido, id_user, id_chat) VALUES ('${formattedDate}', '${content}', 0, '${id_user}', '${id_chat}')`
            );

            res.send({
                message: "ok",
                content: content
            });

        } else {
            res.send({
                message: "El mensaje está vacío"
            });
        }
    } catch (error) {
        res.send(error);
    }
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


