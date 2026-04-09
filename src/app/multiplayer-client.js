/**
 * Multiplayer Client - Cliente para juego multijugador online
 * Requiere: socket.io-client
 */

class MultiplayerClient {
    constructor(serverUrl = 'http://localhost:5000') {
        this.serverUrl = serverUrl;
        this.socket = null;
        this.roomId = null;
        this.playerId = null;
        this.playerName = null;
        this.isPlayer1 = false;
        this.listeners = {};

        this.initializeSocket();
    }

    /**
     * Inicializa la conexión con Socket.IO
     */
    initializeSocket() {
        // Cargar Socket.IO desde CDN
        if (typeof io === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
            script.onload = () => this._connectSocket();
            document.head.appendChild(script);
        } else {
            this._connectSocket();
        }
    }

    /**
     * Realiza la conexión con Socket.IO
     */
    _connectSocket() {
        this.socket = io(this.serverUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => this._onConnect());
        this.socket.on('disconnect', () => this._onDisconnect());
        this.socket.on('connection_response', (data) => this._onConnectionResponse(data));
        this.socket.on('game_state', (data) => this._onGameState(data));
        this.socket.on('player_joined', (data) => this._onPlayerJoined(data));
        this.socket.on('game_over', (data) => this._onGameOver(data));
        this.socket.on('new_message', (data) => this._onNewMessage(data));
        this.socket.on('error', (data) => this._onError(data));
    }

    /**
     * Crea una nueva sala de juego
     * @param {string} playerName - Nombre del jugador
     * @returns {Promise}
     */
    createGame(playerName) {
        return fetch(`${this.serverUrl}/api/create-room`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerName })
        })
        .then(res => res.json())
        .then(data => {
            this.roomId = data.room_id;
            this.playerName = playerName;
            this.isPlayer1 = true;
            this._emit('game_created', data);
            return data;
        });
    }

    /**
     * Obtiene las salas disponibles
     * @returns {Promise}
     */
    getAvailableRooms() {
        return fetch(`${this.serverUrl}/api/rooms`)
            .then(res => res.json())
            .catch(err => {
                console.error('Error fetching rooms:', err);
                return [];
            });
    }

    /**
     * Se une a una sala de juego existente
     * @param {string} roomId - ID de la sala
     * @param {string} playerName - Nombre del jugador
     */
    joinGame(roomId, playerName) {
        this.roomId = roomId;
        this.playerName = playerName;
        this.isPlayer1 = false;

        this.socket.emit('join_game', {
            room_id: roomId,
            player_name: playerName
        });
    }

    /**
     * Realiza un movimiento en el juego
     * @param {number} index - Índice de la celda (0-8)
     */
    makeMove(index) {
        this.socket.emit('make_move', {
            room_id: this.roomId,
            index: index
        });
    }

    /**
     * Reinicia el juego
     */
    resetGame() {
        this.socket.emit('reset_game', {
            room_id: this.roomId
        });
    }

    /**
     * Envía un mensaje de chat
     * @param {string} message - Mensaje a enviar
     */
    sendChatMessage(message) {
        this.socket.emit('chat_message', {
            room_id: this.roomId,
            message: message
        });
    }

    /**
     * Se suscribe a eventos
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función a ejecutar
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Emite un evento
     * @param {string} event - Nombre del evento
     * @param {any} data - Datos a enviar
     */
    _emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // Manejadores de eventos privados
    _onConnect() {
        console.log('Conectado al servidor');
        this._emit('connected', { message: 'Conectado al servidor' });
    }

    _onDisconnect() {
        console.log('Desconectado del servidor');
        this._emit('disconnected', { message: 'Desconectado del servidor' });
    }

    _onConnectionResponse(data) {
        this.playerId = data.player_id;
        this._emit('connection_response', data);
    }

    _onGameState(data) {
        this._emit('game_state', data);
    }

    _onPlayerJoined(data) {
        this._emit('player_joined', data);
    }

    _onGameOver(data) {
        this._emit('game_over', data);
    }

    _onNewMessage(data) {
        this._emit('chat_message', data);
    }

    _onError(data) {
        console.error('Error:', data);
        this._emit('error', data);
    }
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiplayerClient;
}
