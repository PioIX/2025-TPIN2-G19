**<ins>PRESUPUESTO PROYECTO FINAL</ins>**

**Propuesta de la aplicación:**
> Nuestra propuesta es realizar el juego CLUE. El juego se trata de descubrir un crimen: el asesino, el lugar y el arma, los cuales se eligen aleatoriamente cuando comienza la partida. Cada jugador va a ser un detective. Al empezar el juego todos van a tener un anotador con todos los sospechosos, armas y lugares posibles, el cual tienen que usar durante el juego para ir resolviendo el misterio. Todas las “cartas” (sospechosos, armas y lugares) que no forman parte del crimen se reparten aleatoriamente entre los jugadores (se tachan los casilleros de su anotador). Luego se comienza la partida.

Cada uno tiene que seguir estos pasos en su turno:
- Tirar el dado.
- Según el número del dado moverse por las casillas. 
- Si entras en una habitación, realizar una hipótesis.

Moverse en el tablero:
- Te podes mover vertical u horizontalmente, nunca en diagonal.
- Si una casilla está ocupada por otro jugador no se puede pasar ni caer en la misma.
- Entrar a una habitación cuenta como movimiento, por llegar a una puerta no significa que puedas entrar a la habitación.
- Si la habitación en la que estás tiene un pasadizo secreto tenes que elegir entre tirar el dado o utilizar el pasadizo para ir a la habitación a la que lleva.

Cuando entras en una habitación podes hacer una hipótesis para descartar sospechosos, lugares y armas:
- Hacé tus preguntas: ¿Quién?, ¿Dónde? y ¿Con qué arma? 
- El lugar siempre va a ser dónde estás parado; el sospechoso y el arma pueden ser cualquiera.
- El jugador que tenga su turno después que vos va a tener que responder tus preguntas mostrándote una carta que coincida con tus preguntas. En caso de que no coincida ninguna pasa al siguiente en la ronda hasta dar toda la vuelta. Tenés que tachar la carta que te muestren en tu anotador.

Si estás seguro de haber resuelto el misterio podés hacer una acusación:
- Solo podés hacer UNA acusación durante toda la partida.
- Si tu acusación es correcta, ganas el juego.
- Si tu acusación es incorrecta, quedas fuera del juego.
> Cada partida ganada te suma 1 punto. Mientras más puntos, más alto apareces en el ranking de jugadores.

**Funcionalidad:**
Login: Guarda nombre de usuario y contraseña.

Registro: Guarda mail, nombre de usuario y contraseña.

Partida: Se elige el crimen aleatoriamente con los datos de las tablas de Characters, Rooms y Weapons (uno de cada uno) y los que queden se reparten entre los jugadores también aleatoriamente.
En la pantalla se muestra el tablero en el medio, a la izquierda los demás jugadores con sus nombres de usuarios y un botón para acusar; y a la derecha el anotador. Los jugadores saldrán de los casilleros marcados como “salida”, elegidos aleatoriamente y tendrán que ir avanzando conforme el número que haya salido en el dado.

Al momento de hacer una hipótesis saldrá un menú para seleccionar el personaje y arma que desee, pero el lugar ya estará decidido (es el que haya entrado).
Se le mostrará la hipótesis al jugador siguiente, y tendrá que elegir una carta que tenga disponible, siempre y cuando sea parte de la hipótesis realizada anteriormente.
En caso de no tener ninguna carta se muestra un cartel indicando que pase el turno al siguiente jugador.

Al momento de hacer una acusación se muestran tres menúes (sospechosos, lugares, armas), se selecciona una opción en cada uno y se confirma la acusación. En caso de ser correcta, ese jugador gana y termina la partida. Por el contrario, si es incorrecta, ese jugador quedará eliminado y la partida continuará.