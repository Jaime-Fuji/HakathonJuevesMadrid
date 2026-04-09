# Multiplayer Tres en Raya - Setup

## Backend (Flask)

### Instalación

1. Asegúrate de tener Python 3.8+ instalado
2. Ve a la carpeta `backend`:
```bash
cd backend
```

3. Instala las dependencias:
```bash
pip install -r requirements.txt
```

### Ejecutar el servidor

```bash
python app.py
```

El servidor estará disponible en `http://localhost:5000`

### Endpoints disponibles

- `GET /` - Estado del servidor
- `GET /api/rooms` - Obtiene salas disponibles
- `POST /api/create-room` - Crea una nueva sala

### Eventos WebSocket

**Cliente → Servidor:**
- `join_game` - Se une a una sala
- `make_move` - Realiza un movimiento
- `reset_game` - Reinicia el juego
- `chat_message` - Envía mensaje de chat

**Servidor → Cliente:**
- `connection_response` - Respuesta de conexión
- `game_state` - Estado actual del juego
- `player_joined` - Jugador se unió
- `game_over` - Juego terminó
- `new_message` - Nuevo mensaje de chat
- `error` - Error en la operación

## Frontend

### Usar el cliente multijugador

1. Incluir el archivo:
```html
<script src="src/app/multiplayer-client.js"></script>
```

2. Crear instancia del cliente:
```javascript
const multiplayer = new MultiplayerClient('http://localhost:5000');

// Crear nuevo juego
multiplayer.createGame('NombreJugador')
  .then(data => console.log('Juego creado:', data));

// Unirse a un juego
multiplayer.joinGame(roomId, 'NombreJugador');

// Realizar movimiento
multiplayer.makeMove(0); // índice de celda

// Escuchar eventos
multiplayer.on('game_state', (state) => {
  console.log('Estado del juego:', state);
});

multiplayer.on('game_over', (data) => {
  console.log('Ganador:', data.winner);
});
```

## Notas

- El servidor usa Socket.IO para comunicación en tiempo real
- Las sesiones se limpian automáticamente después de desconexión
- Las salas se eliminan cuando ambos jugadores se desconectan
- El sistema está diseñado para escalabilidad con Redis (opcional)
